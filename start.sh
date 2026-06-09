#!/usr/bin/env bash
set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[1;34m'
RED='\033[0;31m'
NC='\033[0m'

print_step() {
  echo -e "\n${BLUE}>>> [STEP] $1${NC}"
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo -e "${RED}[ERROR] Missing required command: $1${NC}"
    exit 1
  fi
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

print_step "Preflight checks"
require_cmd kubectl

echo -e "${YELLOW}Checking cluster connectivity...${NC}"
kubectl version --client >/dev/null
kubectl cluster-info --request-timeout=5s >/dev/null 2>&1
echo -e "${GREEN}[OK] kubectl can reach the cluster.${NC}"

print_step "1/6: Creating namespaces"
kubectl apply -f kubernetes/namespaces.yaml
echo -e "${GREEN}[OK] Namespaces ready.${NC}"

print_step "2/6: Deploying demo workloads"
kubectl apply -f kubernetes/sample-apps.yaml
kubectl -n mesh-demo rollout status deployment/billing --timeout=120s
kubectl -n mesh-demo rollout status deployment/frontend --timeout=120s
kubectl -n mesh-demo rollout status deployment/rogue --timeout=120s
echo -e "${GREEN}[OK] Demo workloads ready.${NC}"

print_step "3/6: Applying Istio mTLS and auth policies"
kubectl apply -f istio/authorization_policies.yaml
kubectl apply -f istio/gateway.yaml
echo -e "${GREEN}[OK] Istio policies applied.${NC}"

print_step "4/6: Applying Cilium L7 policy"
kubectl apply -f cilium/l7_policy.yaml
echo -e "${GREEN}[OK] Cilium policy applied.${NC}"

print_step "5/6: Applying SPIRE and cert-manager manifests (best effort)"
if kubectl get crd clusterspiffeids.spire.spiffe.io >/dev/null 2>&1; then
  kubectl apply -f spire/client_registration.yaml
  echo -e "${GREEN}[OK] SPIRE ClusterSPIFFEID resources applied.${NC}"
else
  echo -e "${YELLOW}[WARN] SPIRE CRDs not found. Skipping spire/client_registration.yaml.${NC}"
fi

kubectl apply -f spire/server_config.yaml || true
if kubectl get crd clusterissuers.cert-manager.io >/dev/null 2>&1; then
  kubectl apply -f cert-manager/vault-issuer.yaml
  kubectl apply -f cert-manager/certificate.yaml
  echo -e "${GREEN}[OK] Cert-manager resources applied.${NC}"
else
  echo -e "${YELLOW}[WARN] cert-manager CRDs not found. Skipping cert-manager manifests.${NC}"
fi

print_step "6/6: Applying ClusterMesh notes"
kubectl apply -f cilium/clustermesh.yaml || true
echo -e "${GREEN}[OK] Baseline resources applied.${NC}"

echo -e "\n${GREEN}============================================================${NC}"
echo -e "${GREEN}ZERO-TRUST SERVICE MESH BASELINE DEPLOYED${NC}"
echo -e "${GREEN}============================================================${NC}"

echo -e "\n${YELLOW}Run these verification commands:${NC}"
echo -e "1) Authorized frontend -> billing /checkout"
echo -e "   kubectl -n mesh-demo exec deploy/frontend -- sh -c 'curl -si http://billing:8080/checkout'"
echo -e ""
echo -e "2) Blocked frontend -> billing /admin (Istio DENY)"
echo -e "   kubectl -n mesh-demo exec deploy/frontend -- sh -c 'curl -si http://billing:8080/admin'"
echo -e ""
echo -e "3) Blocked rogue -> billing /checkout (Cilium L7 policy)"
echo -e "   kubectl -n mesh-demo exec deploy/rogue -- sh -c 'curl -si --max-time 5 http://billing:8080/checkout || true'"
echo -e ""
echo -e "4) Optional mTLS proof"
echo -e "   istioctl authn tls-check billing.mesh-demo.svc.cluster.local -n mesh-demo"
