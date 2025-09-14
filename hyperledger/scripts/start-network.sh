#!/bin/bash

# HERBIONYX Network Startup Script
echo "🌿 Starting HERBIONYX Hyperledger Fabric Network..."

# Clean up any existing containers
echo "🧹 Cleaning up existing containers..."
docker-compose down
docker system prune -f

# Generate crypto material
echo "🔐 Generating crypto material..."
cryptogen generate --config=crypto-config.yaml

# Generate genesis block and channel artifacts
echo "📋 Generating genesis block..."
configtxgen -profile HerbionyxOrdererGenesis -channelID system-channel -outputBlock ./channel-artifacts/genesis.block

echo "📦 Generating channel configuration..."
configtxgen -profile AyurvedaChannel -outputCreateChannelTx ./channel-artifacts/ayurveda-channel.tx -channelID ayurveda-channel

# Start the network
echo "🐳 Starting Docker containers..."
docker-compose up -d

# Wait for network to initialize
echo "⏳ Waiting for network to initialize..."
sleep 30

echo "✅ HERBIONYX Network started successfully!"
echo "🌐 Network is ready for chaincode deployment"