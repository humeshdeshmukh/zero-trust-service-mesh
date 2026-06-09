#!/usr/bin/env bash
set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[1;34m'
NC='\033[0m'

print_step() {
  echo -e "\n${BLUE}>>> [STEP] $1${NC}"
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

print_step "1/4: Deleting policy manifests"
kubectl delete -f cilium/l7_policy.yaml --ignore-not-found=true
kubectl delete -f istio/gateway.yaml --ignore-not-found=true
kubectl delete -f istio/authorization_policies.yaml --ignore-not-found=true
echo -e "${GREEN}[OK] Network and mesh policies removed.${NC}"

print_step "2/4: Deleting SPIRE and cert-manager manifests"
kubectl delete -f spire/client_registration.yaml --ignore-not-found=true || true
kubectl delete -f spire/server_config.yaml --ignore-not-found=true || true
kubectl delete -f cert-manager/certificate.yaml --ignore-not-found=true || true
kubectl delete -f cert-manager/vault-issuer.yaml --ignore-not-found=true || true
kubectl delete -f cilium/clustermesh.yaml --ignore-not-found=true || true
echo -e "${GREEN}[OK] Identity/PKI manifests removed.${NC}"

print_step "3/4: Deleting sample workloads"
kubectl delete -f kubernetes/sample-apps.yaml --ignore-not-found=true
echo -e "${GREEN}[OK] Workloads removed.${NC}"

print_step "4/4: Deleting namespaces"
kubectl delete -f kubernetes/namespaces.yaml --ignore-not-found=true
echo -e "${GREEN}[OK] Namespaces removed.${NC}"

echo -e "\n${GREEN}============================================================${NC}"
echo -e "${GREEN}ZERO-TRUST SERVICE MESH TEARDOWN COMPLETE${NC}"
echo -e "${GREEN}============================================================${NC}"
