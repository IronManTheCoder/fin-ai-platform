# 🏗️ Fin-AI Platform Architecture

## Overview

The Fin-AI Platform is an enterprise-grade, multi-model AI system that integrates LLM orchestration, RAG, agentic workflows, and FinTech data pipelines. The architecture is designed for scalability, observability, and production readiness.

## System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer                              │
│  (React Dashboard / API Consumers / CLI Tools)              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              API Gateway (AWS API Gateway v2)                │
│              - HTTP API                                      │
│              - Authentication & Rate Limiting                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│           Platform API Service (Lambda)                      │
│           - Request Routing                                  │
│           - Multi-Provider Support (Bedrock/Groq)            │
│           - Response Formatting                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   LLM Layer  │ │  RAG Service │ │Agent Service │
│              │ │              │ │              │
│ AWS Bedrock  │ │ Vector DB    │ │ LangGraph    │
│ OpenAI       │ │ (OpenSearch) │ │ Orchestration│
│ Anthropic    │ │              │ │              │
│ Gemini       │ │ Embeddings   │ │ Claude Code  │
│ Groq (Fallback)│ │ Retrieval   │ │ Cursor       │
└──────────────┘ └──────┬───────┘ └──────┬───────┘
                        │                 │
                        ▼                 ▼
              ┌─────────────────────────────┐
              │   Data Pipeline Layer       │
              │                             │
              │ Snowflake (Warehouse)       │
              │ Databricks (ETL)            │
              │ FinTech Data Sources        │
              └─────────────────────────────┘
```

## Core Components

### 1. Infrastructure Layer (Terraform)

#### Bedrock Gateway Module
- **Purpose**: Exposes LLM models via HTTP API
- **Components**:
  - API Gateway v2 (HTTP API)
  - Lambda function for request handling
  - IAM roles and policies
  - CloudWatch logging
- **Features**:
  - Multi-provider support (Bedrock primary, Groq fallback)
  - Environment variable configuration
  - Cost and latency metrics

#### Vector DB Module
- **Purpose**: Manages vector embeddings for RAG
- **Components**:
  - OpenSearch Serverless (or pgvector)
  - Index management
  - Access policies
- **Features**:
  - Semantic search capabilities
  - Document chunking and indexing

#### Agent Platform Module
- **Purpose**: Orchestrates agentic workflows
- **Components**:
  - LangGraph state machines
  - Agent execution environment
  - Workflow persistence
- **Features**:
  - Multi-step reasoning
  - Tool calling capabilities
  - Audit logging

### 2. Service Layer

#### Platform API Service
- **Language**: TypeScript
- **Runtime**: Node.js 20.x (Lambda)
- **Responsibilities**:
  - Request validation and routing
  - Provider selection (Bedrock/Groq/Auto)
  - Response formatting
  - Error handling and fallback logic
- **Key Features**:
  - Automatic fallback from Bedrock to Groq
  - Model ID mapping between providers
  - Comprehensive logging
  - Environment-based configuration

#### RAG Service
- **Language**: Python
- **Responsibilities**:
  - Document ingestion and chunking
  - Embedding generation
  - Vector search and retrieval
  - Context assembly for LLM prompts
- **Key Features**:
  - Multi-format document support
  - Chunking strategies
  - Relevance scoring
  - PII detection and redaction

#### Agent Service
- **Language**: Python
- **Framework**: LangGraph
- **Responsibilities**:
  - Workflow orchestration
  - Tool execution
  - State management
  - Decision making
- **Key Features**:
  - DevOps automation workflows
  - Code generation and testing
  - PR creation and management
  - Audit trails

#### Data Pipeline Service
- **Language**: Python
- **Responsibilities**:
  - ETL from FinTech data sources
  - Data transformation and validation
  - Loading into Snowflake/Databricks
  - Trade surveillance analytics
- **Key Features**:
  - Batch and streaming processing
  - Data quality checks
  - Anomaly detection
  - Dashboard data preparation

### 3. Data Layer

#### Vector Database (OpenSearch Serverless)
- **Purpose**: Store and search document embeddings
- **Schema**:
  - Document chunks
  - Embeddings (vector fields)
  - Metadata (source, timestamp, etc.)
- **Operations**:
  - Semantic similarity search
  - Hybrid search (keyword + vector)
  - Filtering and faceting

#### Data Warehouse (Snowflake)
- **Purpose**: Centralized FinTech data storage
- **Schema**:
  - Trade transactions
  - Market data
  - Customer information
  - Historical analytics
- **Operations**:
  - SQL queries
  - Aggregations
  - Time-series analysis

#### ETL Platform (Databricks)
- **Purpose**: Data transformation and processing
- **Operations**:
  - Data ingestion
  - Transformation pipelines
  - Feature engineering
  - Model training data preparation

### 4. LLM Provider Layer

#### AWS Bedrock (Primary)
- **Models**: Claude 3.7 Sonnet, Claude 3.5 Haiku, Amazon Titan, Meta Llama
- **Features**: Serverless, pay-per-use, enterprise security
- **Use Cases**: Production workloads, enterprise compliance

#### Groq (Fallback)
- **Models**: Llama 3.3 70B, Llama 3.1 8B
- **Features**: High-speed inference, free tier
- **Use Cases**: Development, testing, cost optimization

#### OpenAI (Future)
- **Models**: GPT-4, GPT-3.5
- **Use Cases**: Specific model requirements

#### Anthropic (Future)
- **Models**: Claude Opus, Claude Sonnet
- **Use Cases**: Advanced reasoning tasks

#### Google Gemini (Future)
- **Models**: Gemini 1.5 Pro
- **Use Cases**: Multimodal capabilities

## Data Flow

### RAG Query Flow
```
User Query → API Gateway → Platform API → RAG Service
                                              ↓
                                    Vector DB Search
                                              ↓
                                    Context Assembly
                                              ↓
                                    LLM Provider (Bedrock/Groq)
                                              ↓
                                    Response → User
```

### Agent Workflow Flow
```
User Request → API Gateway → Agent Service
                                  ↓
                            LangGraph Orchestration
                                  ↓
                            Tool Selection & Execution
                                  ↓
                            State Update & Decision
                                  ↓
                            Next Step or Completion
                                  ↓
                            Response → User
```

### FinTech Data Flow
```
Data Sources → Databricks ETL → Snowflake Warehouse
                                        ↓
                              Agent Service / Analytics
                                        ↓
                              Anomaly Detection
                                        ↓
                              Dashboard / Alerts
```

## Security & Compliance

### Authentication & Authorization
- API Gateway authentication (API keys / IAM)
- IAM roles for Lambda functions
- VPC endpoints for private access (future)

### Data Protection
- PII detection and redaction
- Encryption at rest and in transit
- Access logging and audit trails

### Guardrails
- Refusal policies for sensitive queries
- Content filtering
- Rate limiting
- Cost controls

## Observability

### Metrics
- **Cost**: Per-model, per-request cost tracking
- **Latency**: P50, P95, P99 response times
- **Accuracy**: RAG retrieval accuracy, agent success rates
- **Safety**: Guardrail trigger rates, PII detection rates

### Logging
- CloudWatch Logs for all services
- Structured logging with correlation IDs
- Error tracking and alerting

### Monitoring
- CloudWatch Dashboards
- Grafana (future)
- Custom metrics and alarms

## Deployment Architecture

### Environments
- **dev**: Development and testing
- **qa**: Quality assurance and staging
- **prod**: Production workloads

### Infrastructure as Code
- Terraform modules for all components
- Environment-specific configurations
- Version-controlled infrastructure

### CI/CD Pipeline (Future)
- Automated testing
- Infrastructure validation
- Deployment automation
- Rollback capabilities

## Scalability Considerations

### Horizontal Scaling
- Lambda auto-scaling
- API Gateway throttling
- Vector DB sharding

### Performance Optimization
- Response caching
- Connection pooling
- Batch processing
- Async operations

### Cost Optimization
- Provider selection based on workload
- Model selection based on task complexity
- Caching frequently accessed data
- Reserved capacity (future)

