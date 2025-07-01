import asyncio
import logging
from typing import Dict, Any, List, Optional
from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM
from sentence_transformers import SentenceTransformer
import torch
import numpy as np
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import FAISS
from langchain.docstore.document import Document
import json
import os

logger = logging.getLogger(__name__)

class AIService:
    """Service for AI-powered meeting insights including summarization, sentiment analysis, and RAG."""
    
    def __init__(self):
        self.summarizer = None
        self.sentiment_analyzer = None
        self.embeddings = None
        self.vectorstore = None
        self.device = 0 if torch.cuda.is_available() else -1
        self.knowledge_base_path = "data/knowledge_base"
        
    async def initialize(self):
        """Initialize AI models."""
        try:
            logger.info("Initializing AI models...")
            
            # Initialize models in executor to avoid blocking
            loop = asyncio.get_event_loop()
            
            # Load summarization model (BART)
            logger.info("Loading BART for summarization...")
            self.summarizer = await loop.run_in_executor(
                None,
                lambda: pipeline(
                    "summarization",
                    model="facebook/bart-large-cnn",
                    device=self.device
                )
            )
            
            # Load sentiment analysis model (DistilBERT)
            logger.info("Loading DistilBERT for sentiment analysis...")
            self.sentiment_analyzer = await loop.run_in_executor(
                None,
                lambda: pipeline(
                    "sentiment-analysis",
                    model="distilbert-base-uncased-finetuned-sst-2-english",
                    device=self.device
                )
            )
            
            # Load embeddings for RAG
            logger.info("Loading embeddings for RAG...")
            self.embeddings = await loop.run_in_executor(
                None,
                lambda: HuggingFaceEmbeddings(
                    model_name="sentence-transformers/all-MiniLM-L6-v2"
                )
            )
            
            # Initialize or load knowledge base
            await self._initialize_knowledge_base()
            
            logger.info("AI models initialized successfully")
            
        except Exception as e:
            logger.error(f"Error initializing AI models: {e}")
            raise
    
    def is_ready(self) -> bool:
        """Check if all AI services are ready."""
        return all([
            self.summarizer is not None,
            self.sentiment_analyzer is not None,
            self.embeddings is not None
        ])
    
    async def generate_summary(self, text: str, max_length: int = 150, min_length: int = 30) -> Dict[str, Any]:
        """Generate a summary of the meeting transcript."""
        if not self.summarizer:
            raise RuntimeError("Summarizer not initialized")
        
        try:
            # Truncate text if too long for the model
            max_input_length = 1024
            if len(text.split()) > max_input_length:
                words = text.split()
                text = " ".join(words[:max_input_length])
            
            # Run summarization in executor
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None,
                lambda: self.summarizer(
                    text,
                    max_length=max_length,
                    min_length=min_length,
                    do_sample=False
                )
            )
            
            summary_text = result[0]["summary_text"]
            
            # Extract action items using simple heuristics
            action_items = self._extract_action_items(text)
            
            return {
                "summary": summary_text,
                "action_items": action_items,
                "word_count": len(text.split()),
                "summary_ratio": len(summary_text.split()) / len(text.split())
            }
            
        except Exception as e:
            logger.error(f"Error generating summary: {e}")
            raise
    
    async def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment of the text."""
        if not self.sentiment_analyzer:
            raise RuntimeError("Sentiment analyzer not initialized")
        
        try:
            # Truncate text if too long
            if len(text) > 512:
                text = text[:512]
            
            # Run sentiment analysis in executor
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None,
                lambda: self.sentiment_analyzer(text)
            )
            
            return {
                "label": result[0]["label"],
                "score": result[0]["score"],
                "confidence": "high" if result[0]["score"] > 0.8 else "medium" if result[0]["score"] > 0.6 else "low"
            }
            
        except Exception as e:
            logger.error(f"Error analyzing sentiment: {e}")
            return {"label": "NEUTRAL", "score": 0.5, "confidence": "low"}
    
    async def get_rag_insights(self, transcript: str, k: int = 3) -> Optional[Dict[str, Any]]:
        """Get RAG-enhanced insights by retrieving relevant context."""
        if not self.vectorstore:
            logger.warning("Vector store not available for RAG")
            return None
        
        try:
            # Generate query for relevant context
            query = await self._generate_context_query(transcript)
            
            # Retrieve relevant documents
            loop = asyncio.get_event_loop()
            relevant_docs = await loop.run_in_executor(
                None,
                lambda: self.vectorstore.similarity_search(query, k=k)
            )
            
            if not relevant_docs:
                return None
            
            # Combine context with current transcript for enhanced insights
            context = "\n".join([doc.page_content for doc in relevant_docs])
            
            # Generate enhanced summary with context
            enhanced_summary = await self._generate_contextual_summary(transcript, context)
            
            return {
                "enhanced_summary": enhanced_summary,
                "relevant_context": [doc.page_content for doc in relevant_docs],
                "context_sources": [doc.metadata for doc in relevant_docs]
            }
            
        except Exception as e:
            logger.error(f"Error getting RAG insights: {e}")
            return None
    
    async def add_to_knowledge_base(self, content: str, metadata: Dict[str, Any] = None):
        """Add new content to the knowledge base."""
        try:
            if not self.vectorstore:
                await self._initialize_knowledge_base()
            
            # Split content into chunks
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200
            )
            
            docs = text_splitter.create_documents(
                [content],
                metadatas=[metadata or {}]
            )
            
            # Add to vector store
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                None,
                lambda: self.vectorstore.add_documents(docs)
            )
            
            # Save updated knowledge base
            await self._save_knowledge_base()
            
            logger.info(f"Added {len(docs)} documents to knowledge base")
            
        except Exception as e:
            logger.error(f"Error adding to knowledge base: {e}")
    
    def _extract_action_items(self, text: str) -> List[str]:
        """Extract action items from text using simple heuristics."""
        action_indicators = [
            "need to", "should", "will", "must", "action item",
            "todo", "follow up", "assign", "schedule", "deadline"
        ]
        
        action_items = []
        sentences = text.split('.')
        
        for sentence in sentences:
            sentence = sentence.strip().lower()
            if any(indicator in sentence for indicator in action_indicators):
                # Clean up and add if meaningful
                clean_sentence = sentence.strip(' .,!?').capitalize()
                if len(clean_sentence) > 10:  # Minimum length filter
                    action_items.append(clean_sentence)
        
        return action_items[:10]  # Limit to 10 action items
    
    async def _generate_context_query(self, transcript: str) -> str:
        """Generate a query for context retrieval based on transcript."""
        # Extract key topics/entities from transcript
        words = transcript.lower().split()
        
        # Simple keyword extraction (could be enhanced with NER)
        important_words = []
        skip_words = set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'])
        
        word_freq = {}
        for word in words:
            word = word.strip('.,!?;:')
            if len(word) > 3 and word not in skip_words:
                word_freq[word] = word_freq.get(word, 0) + 1
        
        # Get top keywords
        top_keywords = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:5]
        query = " ".join([word for word, freq in top_keywords])
        
        return query
    
    async def _generate_contextual_summary(self, transcript: str, context: str) -> str:
        """Generate an enhanced summary using retrieved context."""
        try:
            # Combine transcript and context
            combined_text = f"Context: {context}\n\nCurrent Meeting: {transcript}"
            
            # Generate summary
            summary_result = await self.generate_summary(combined_text, max_length=200)
            return summary_result["summary"]
            
        except Exception as e:
            logger.error(f"Error generating contextual summary: {e}")
            # Fallback to regular summary
            summary_result = await self.generate_summary(transcript)
            return summary_result["summary"]
    
    async def _initialize_knowledge_base(self):
        """Initialize or load existing knowledge base."""
        try:
            os.makedirs(self.knowledge_base_path, exist_ok=True)
            
            # Try to load existing knowledge base
            kb_file = os.path.join(self.knowledge_base_path, "vectorstore")
            
            if os.path.exists(kb_file):
                logger.info("Loading existing knowledge base...")
                loop = asyncio.get_event_loop()
                self.vectorstore = await loop.run_in_executor(
                    None,
                    lambda: FAISS.load_local(kb_file, self.embeddings)
                )
            else:
                logger.info("Creating new knowledge base...")
                # Create with initial dummy document
                initial_docs = [
                    Document(
                        page_content="Meeting assistant knowledge base initialized.",
                        metadata={"source": "system", "type": "init"}
                    )
                ]
                
                loop = asyncio.get_event_loop()
                self.vectorstore = await loop.run_in_executor(
                    None,
                    lambda: FAISS.from_documents(initial_docs, self.embeddings)
                )
                
                await self._save_knowledge_base()
            
        except Exception as e:
            logger.error(f"Error initializing knowledge base: {e}")
            # Create minimal in-memory vectorstore as fallback
            initial_docs = [
                Document(
                    page_content="Fallback knowledge base.",
                    metadata={"source": "fallback"}
                )
            ]
            self.vectorstore = FAISS.from_documents(initial_docs, self.embeddings)
    
    async def _save_knowledge_base(self):
        """Save knowledge base to disk."""
        try:
            if self.vectorstore:
                kb_file = os.path.join(self.knowledge_base_path, "vectorstore")
                loop = asyncio.get_event_loop()
                await loop.run_in_executor(
                    None,
                    lambda: self.vectorstore.save_local(kb_file)
                )
                logger.info("Knowledge base saved")
        except Exception as e:
            logger.error(f"Error saving knowledge base: {e}")
