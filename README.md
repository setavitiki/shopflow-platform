# Cloud-Native ShopFlow Microservices Platform Platform

[![AWS EKS](https://img.shields.io/badge/AWS-EKS-orange.svg)](https://aws.amazon.com/eks/)
[![Istio](https://img.shields.io/badge/Service%20Mesh-Istio-blue.svg)](https://istio.io/)
[![Kubernetes](https://img.shields.io/badge/Orchestration-Kubernetes-326CE5.svg)](https://kubernetes.io/)
[![GitHub Actions](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF.svg)](https://github.com/features/actions)

A production-ready, cloud-native e-commerce platform built with microservices architecture, deployed on AWS EKS with Istio service mesh. This project demonstrates advanced DevOps practices, container orchestration, and modern cloud-native engineering patterns.

## Architecture Overview

This platform implements a sophisticated microservices ecosystem designed for scalability, resilience, and maintainability:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  GitHub Actions │────│  AWS EKS Cluster │────│   Istio Mesh    │
│  CI/CD Pipeline │    │  + Auto Scaling  │    │   Traffic Mgmt  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  ECR Registry   │    │  5 Microservices │    │  Load Balancer  │
│  Container Imgs │    │  + Envoy Proxies │    │  External Acc.  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Core Components
- **5 Microservices**: Authentication, Product Catalog, Order Management, Payment Processing, Notifications
- **Container Orchestration**: AWS Elastic Kubernetes Service (EKS) with managed node groups
- **Service Mesh**: Istio 1.27 with Envoy proxy sidecars for traffic management
- **CI/CD Pipeline**: GitHub Actions with automated testing, building, and deployment
- **Container Registry**: AWS Elastic Container Registry (ECR) with vulnerability scanning
- **Networking**: AWS Application Load Balancer with Istio Gateway integration

## Project Objectives & Learning Outcomes

### Technical Mastery Demonstrated
- **Cloud-Native Architecture**: Microservices design patterns and distributed system principles
- **Container Orchestration**: Advanced Kubernetes concepts including resource management and scaling
- **Service Mesh Integration**: Traffic routing, security policies, and observability
- **DevOps Engineering**: Automated CI/CD pipelines with proper secrets management
- **Infrastructure as Code**: Declarative configuration management and GitOps practices

### Production-Ready Features
- **Zero-Downtime Deployments**: Rolling updates with health checks and readiness probes
- **Horizontal Scaling**: Auto-scaling capabilities for handling variable load
- **Security Best Practices**: Container image scanning, secrets management, and network policies
- **Observability**: Service topology visualization and traffic monitoring
- **Fault Tolerance**: Circuit breaker patterns and retry mechanisms ready for implementation

## Technology Stack

### Infrastructure & Platform
- **Cloud Provider**: Amazon Web Services (AWS)
- **Kubernetes Distribution**: AWS EKS (Elastic Kubernetes Service)
- **Service Mesh**: Istio 1.27 with Envoy proxy
- **Container Runtime**: Docker with multi-stage optimized builds
- **Load Balancing**: AWS Application Load Balancer + Istio Gateway

### Development & Operations
- **Programming Language**: Node.js with Express.js framework
- **CI/CD Platform**: GitHub Actions with matrix builds
- **Container Registry**: AWS ECR with automated vulnerability scanning
- **Version Control**: Git with GitFlow branching strategy
- **Configuration Management**: Kubernetes manifests with environment-specific overlays

### Observability & Monitoring
- **Service Topology**: Kiali dashboard for mesh visualization
- **Traffic Management**: Istio VirtualServices and DestinationRules
- **Health Monitoring**: Kubernetes liveness and readiness probes
- **Logging**: Container-native logging with kubectl integration

## Prerequisites & Requirements

### Local Development Environment
```bash
# Required tools and versions
aws-cli >= 2.0
kubectl >= 1.28
eksctl >= 0.100
istioctl >= 1.27
docker >= 20.0
git >= 2.30
```

### AWS Account Setup
- AWS Account with programmatic access
- IAM user with EKS, ECR, and VPC permissions
- AWS CLI configured with appropriate credentials
- Sufficient service limits for EKS cluster creation

### GitHub Repository Configuration
- Repository with Actions enabled
- Required secrets configured (detailed in setup section)
- Branch protection rules (recommended for production)

## Complete Setup Guide

### Phase 1: Infrastructure Provisioning

#### 1.1 EKS Cluster Creation
```bash
# Create production-ready EKS cluster
eksctl create cluster \
  --name shopflow-cluster \
  --region ap-south-1 \
  --nodes 2 \
  --node-type t3.medium \
  --nodes-min 1 \
  --nodes-max 4 \
  --managed \
  --enable-ssm

# Verify cluster access
kubectl get nodes
kubectl cluster-info
```

#### 1.2 Container Registry Setup
```bash
# Create ECR repositories for each microservice
services=("auth-service" "product-service" "order-service" "payment-service" "notification-service")

for service in "${services[@]}"; do
  aws ecr create-repository \
    --repository-name shopflow/$service \
    --region ap-south-1 \
    --image-scanning-configuration scanOnPush=true
  echo "Created repository for $service"
done

# Verify repository creation
aws ecr describe-repositories --region ap-south-1
```

### Phase 2: CI/CD Pipeline Configuration

#### 2.1 GitHub Secrets Setup
Navigate to your repository → Settings → Secrets and variables → Actions

**Required Repository Secrets:**
- `AWS_ACCESS_KEY_ID`: IAM user access key with EKS/ECR permissions
- `AWS_SECRET_ACCESS_KEY`: Corresponding secret access key
- `AWS_REGION`: ap-south-1 (or your chosen region)
- `AWS_ACCOUNT_ID`: Your 12-digit AWS account identifier
- `EKS_CLUSTER_NAME`: shopflow-cluster

#### 2.2 Initial Deployment
```bash
# Clone and setup repository
git clone <your-repository-url>
cd shopflow-platform

# Create initial commit and push
git add .
git commit -m "feat: initial microservices platform setup"
git push origin main

# Trigger production deployment with version tag
git tag v1.0.0
git push origin v1.0.0
```

### Phase 3: Service Mesh Implementation

#### 3.1 Istio Installation
```bash
# Download and install Istio 1.27
curl -L https://istio.io/downloadIstio | ISTIO_VERSION=1.27.0 sh -
export PATH=$PWD/istio-1.27.0/bin:$PATH

# Install Istio with demo profile for learning
istioctl install --set values.defaultRevision=default -y

# Verify installation
kubectl get pods -n istio-system
```

#### 3.2 Service Mesh Integration
```bash
# Enable automatic sidecar injection
kubectl label namespace shopflow-prod istio-injection=enabled

# Restart deployments to inject Envoy sidecars
kubectl rollout restart deployment -n shopflow-prod

# Verify sidecar injection (should show 2/2 containers)
kubectl get pods -n shopflow-prod
```

#### 3.3 Traffic Management Configuration
```bash
# Apply Istio Gateway and VirtualService
kubectl apply -f istio/gateway.yaml
kubectl apply -f istio/virtualservice.yaml

# Get external access URL
export INGRESS_HOST=$(kubectl -n istio-system get service istio-ingressgateway -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
echo "Application accessible at: http://$INGRESS_HOST"
```

## Project Structure

```
shopflow-platform/
├── services/                           # Microservices source code
│   ├── auth-service/
│   │   ├── src/
│   │   ├── package.json
│   │   └── Dockerfile
│   ├── product-service/
│   ├── order-service/
│   ├── payment-service/
│   └── notification-service/
├── k8s/                              # Kubernetes manifests
│   ├── auth-service.yaml             # Deployment + Service configs
│   ├── product-service.yaml
│   ├── order-service.yaml
│   ├── payment-service.yaml
│   └── notification-service.yaml
├── istio/                            # Service mesh configuration
│   ├── gateway.yaml                  # External traffic entry point
│   ├── virtualservice.yaml           # Traffic routing rules
│   └── destinationrules.yaml         # Load balancing policies
├── .github/workflows/                # CI/CD automation
│   ├── microservices-ci.yaml         # Development workflow
│   └── production-deploy.yaml        # Production deployment
├── docs/                             # Additional documentation
└── README.md                         # This file
```

## CI/CD Pipeline Architecture

### Development Workflow
**Trigger**: Push to `develop` or `main` branches
```
Build Services → Run Tests → Push to ECR → Deploy to Dev → Integration Tests
```

### Production Workflow
**Trigger**: Git tag creation (v*.*.*)
```
Extract Version → Build All Services → Push to ECR → Deploy to Production → Health Checks
```

### Pipeline Features
- **Path-based Service Detection**: Only builds modified services
- **Parallel Execution**: Concurrent builds for faster deployment
- **Automated Versioning**: Git tags drive version management
- **Zero-Downtime Deployment**: Rolling updates with readiness checks
- **Rollback Capability**: Automated rollback on deployment failure

## Operations & Management

### Monitoring & Observability
```bash
# Access Kiali dashboard for service mesh visualization
istioctl dashboard kiali

# Monitor service health
kubectl get pods -n shopflow-prod -w

# View service logs
kubectl logs -f deployment/auth-service -n shopflow-prod

# Check service mesh proxy status
istioctl proxy-status
```

### Scaling Operations
```bash
# Scale individual services
kubectl scale deployment auth-service --replicas=3 -n shopflow-prod

# Scale cluster nodes (when needed)
eksctl scale nodegroup --cluster shopflow-cluster --name <nodegroup-name> --nodes 3
```

### Traffic Testing
```bash
# Test service endpoints
curl -s http://$INGRESS_HOST/products
curl -s http://$INGRESS_HOST/orders
curl -s http://$INGRESS_HOST/auth/health

# Generate load for testing
for i in {1..100}; do
  curl -s http://$INGRESS_HOST/products > /dev/null
  sleep 1
done
```

## Challenges Overcome & Solutions Implemented

### 1. GitHub Actions Secrets Management
**Challenge**: Initial confusion between environment-scoped and repository-scoped secrets
**Solution**: Migrated to repository-level secrets for broader accessibility across workflows
**Learning**: Understanding GitHub Actions secret scoping and environment contexts

### 2. Container Registry Authentication
**Challenge**: ErrImageNeverPull and ErrImagePull errors during deployment
**Solution**: 
- Configured proper ECR authentication with `imagePullSecrets`
- Fixed container image references to use full ECR URIs
- Implemented ECR login in CI/CD pipeline
**Learning**: Container registry integration patterns and Kubernetes authentication

### 3. Kubernetes Resource Management
**Challenge**: Pod scheduling failures due to resource exhaustion
**Solution**: 
- Scaled EKS node groups to accommodate service mesh overhead
- Optimized resource requests and limits in deployment manifests
- Implemented horizontal pod autoscaling readiness
**Learning**: Production Kubernetes resource planning and capacity management

### 4. Service Mesh Integration Complexity
**Challenge**: Istio CRD installation failures and sidecar injection issues
**Solution**:
- Reinstalled Istio with proper demo profile configuration
- Correctly labeled namespaces for automatic sidecar injection
- Configured traffic routing with Gateway and VirtualService resources
**Learning**: Service mesh architecture patterns and configuration management

### 5. CI/CD Pipeline Optimization
**Challenge**: Complex multi-service build coordination and deployment sequencing
**Solution**:
- Implemented path-based change detection for efficient builds
- Created environment-specific deployment strategies
- Added proper error handling and rollback mechanisms
**Learning**: Advanced GitHub Actions patterns and deployment automation

## Testing & Validation

### Service Health Verification
```bash
# Verify all pods are running with sidecars
kubectl get pods -n shopflow-prod
# Expected: Each pod shows 2/2 (application + Envoy proxy)

# Test internal service communication
kubectl exec -it <pod-name> -n shopflow-prod -- curl http://product-service:4000/health

# Validate external access through Istio Gateway
curl -I http://$INGRESS_HOST/products
# Expected: HTTP 200 OK with Istio headers
```

### Service Mesh Validation
```bash
# Check Istio configuration status
istioctl analyze -n shopflow-prod

# Verify traffic routing rules
kubectl get gateway,virtualservice -n shopflow-prod

# Monitor traffic in Kiali dashboard
istioctl dashboard kiali
```

## Performance & Scalability

### Current Capacity
- **Cluster Nodes**: 2 t3.medium instances (4 vCPU, 8 GB RAM)
- **Service Replicas**: 1 per service (scalable to 10+)
- **Request Handling**: ~100 RPS per service with current configuration
- **Storage**: EBS-backed persistent volumes ready for stateful services

### Scaling Strategies
- **Horizontal Pod Autoscaling**: Configured based on CPU/memory metrics
- **Cluster Autoscaling**: Automatic node provisioning based on pod demands
- **Load Balancing**: Istio-managed traffic distribution across service instances

## Contributing & Feedback

This project serves as a comprehensive demonstration of cloud-native engineering practices. While built for educational purposes, the architecture and patterns implemented are production-ready and follow industry best practices.

For questions about the implementation or discussions about cloud-native architecture patterns, feel free to open an issue in this repository.

## License

This project is licensed under the MIT License.

## Author

**Shaun Tavitiki**  