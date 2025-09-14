#!/bin/bash

# HERBIONYX Chaincode Deployment Script
echo "🌿 Deploying HERBIONYX Chaincode..."

# Set environment variables
export FABRIC_CFG_PATH=$PWD
export CORE_PEER_TLS_ENABLED=true
export ORDERER_CA=${PWD}/organizations/ordererOrganizations/herbionyx.com/orderers/orderer.herbionyx.com/msp/tlscacerts/tlsca.herbionyx.com-cert.pem

# Package chaincode
echo "📦 Packaging chaincode..."
peer lifecycle chaincode package herbtraceability.tar.gz \
  --path ../chaincode/herbtraceability \
  --lang java \
  --label herbtraceability_1.0

# Install on all peers
echo "🔧 Installing chaincode on all peers..."

# FarmersCoop peer
export CORE_PEER_LOCALMSPID="FarmersCoopMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/farmers.herbionyx.com/peers/peer0.farmers.herbionyx.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/farmers.herbionyx.com/users/Admin@farmers.herbionyx.com/msp
export CORE_PEER_ADDRESS=localhost:7051

peer lifecycle chaincode install herbtraceability.tar.gz

# LabsOrg peer
export CORE_PEER_LOCALMSPID="LabsOrgMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/labs.herbionyx.com/peers/peer0.labs.herbionyx.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/labs.herbionyx.com/users/Admin@labs.herbionyx.com/msp
export CORE_PEER_ADDRESS=localhost:8051

peer lifecycle chaincode install herbtraceability.tar.gz

# ProcessorsOrg peer
export CORE_PEER_LOCALMSPID="ProcessorsOrgMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/processors.herbionyx.com/peers/peer0.processors.herbionyx.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/processors.herbionyx.com/users/Admin@processors.herbionyx.com/msp
export CORE_PEER_ADDRESS=localhost:9051

peer lifecycle chaincode install herbtraceability.tar.gz

# ManufacturersOrg peer
export CORE_PEER_LOCALMSPID="ManufacturersOrgMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/manufacturers.herbionyx.com/peers/peer0.manufacturers.herbionyx.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/manufacturers.herbionyx.com/users/Admin@manufacturers.herbionyx.com/msp
export CORE_PEER_ADDRESS=localhost:10051

peer lifecycle chaincode install herbtraceability.tar.gz

# NMPBOrg peer
export CORE_PEER_LOCALMSPID="NMPBOrgMSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/nmpb.herbionyx.com/peers/peer0.nmpb.herbionyx.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/nmpb.herbionyx.com/users/Admin@nmpb.herbionyx.com/msp
export CORE_PEER_ADDRESS=localhost:11051

peer lifecycle chaincode install herbtraceability.tar.gz

echo "✅ Chaincode deployment completed!"
echo "🚀 HERBIONYX network is ready for demo!"