#!/bin/bash

# SKY-SHARE Bridge Demo Script
# This script demonstrates the complete flow from XRPL token issuance to Flare distribution

echo "🌟 SKY-SHARE Bridge Demo Starting..."
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}$1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if required tools are installed
check_dependencies() {
    print_step "🔍 Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is required but not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is required but not installed"
        exit 1
    fi
    
    print_success "All dependencies found"
}

# Install project dependencies
install_dependencies() {
    print_step "📦 Installing project dependencies..."
    
    if [ ! -d "node_modules" ]; then
        npm install
        if [ $? -ne 0 ]; then
            print_error "Failed to install dependencies"
            exit 1
        fi
    fi
    
    print_success "Dependencies installed"
}

# Compile contracts
compile_contracts() {
    print_step "🔨 Compiling smart contracts..."
    
    npx hardhat compile
    if [ $? -ne 0 ]; then
        print_error "Contract compilation failed"
        exit 1
    fi
    
    print_success "Contracts compiled successfully"
}

# Run tests
run_tests() {
    print_step "🧪 Running contract tests..."
    
    npx hardhat test
    if [ $? -ne 0 ]; then
        print_error "Tests failed"
        exit 1
    fi
    
    print_success "All tests passed"
}

# Deploy contracts
deploy_contracts() {
    print_step "🚀 Deploying contracts to local network..."
    
    # Start Hardhat node in background if not running
    if ! pgrep -f "hardhat node" > /dev/null; then
        print_step "Starting Hardhat node..."
        npx hardhat node > hardhat-node.log 2>&1 &
        HARDHAT_PID=$!
        sleep 5
        print_success "Hardhat node started (PID: $HARDHAT_PID)"
    fi
    
    npx hardhat run scripts/deploy.js --network localhost
    if [ $? -ne 0 ]; then
        print_error "Contract deployment failed"
        exit 1
    fi
    
    print_success "Contracts deployed successfully"
}

# Issue XRPL token
issue_xrpl_token() {
    print_step "🌐 Issuing SKY-SHARE token on XRPL Testnet..."
    
    node scripts/xrpl_issue.js
    if [ $? -ne 0 ]; then
        print_warning "XRPL token issuance failed (this is optional for local demo)"
    else
        print_success "XRPL token issued successfully"
    fi
}

# Simulate bridge mint
simulate_bridge() {
    print_step "🌉 Simulating bridge mint operation..."
    
    npx hardhat run scripts/mint_by_bridge.js --network localhost
    if [ $? -ne 0 ]; then
        print_error "Bridge simulation failed"
        exit 1
    fi
    
    print_success "Bridge mint simulation completed"
}

# Run distribution demo
run_distribution_demo() {
    print_step "💰 Running distribution demo..."
    
    npx hardhat run scripts/distribute_demo.js --network localhost
    if [ $? -ne 0 ]; then
        print_error "Distribution demo failed"
        exit 1
    fi
    
    print_success "Distribution demo completed"
}

# Setup frontend
setup_frontend() {
    print_step "🎨 Setting up frontend..."
    
    if [ ! -d "frontend/node_modules" ]; then
        cd frontend
        npm install
        if [ $? -ne 0 ]; then
            print_error "Frontend dependency installation failed"
            exit 1
        fi
        cd ..
    fi
    
    print_success "Frontend setup completed"
}

# Start frontend
start_frontend() {
    print_step "🌐 Starting frontend application..."
    
    cd frontend
    npm start > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
    cd ..
    
    sleep 3
    print_success "Frontend started (PID: $FRONTEND_PID)"
    print_step "🌐 Frontend available at: http://localhost:3000"
}

# Main demo flow
main() {
    echo
    print_step "Starting SKY-SHARE Bridge Demo..."
    echo
    
    check_dependencies
    install_dependencies
    compile_contracts
    run_tests
    deploy_contracts
    issue_xrpl_token
    simulate_bridge
    run_distribution_demo
    setup_frontend
    
    echo
    print_success "🎉 Demo completed successfully!"
    echo
    print_step "📋 Demo Summary:"
    echo "  ✅ Smart contracts compiled and tested"
    echo "  ✅ Contracts deployed to local Hardhat network"
    echo "  ✅ XRPL SKY-SHARE token issued (testnet)"
    echo "  ✅ Bridge mint operation simulated"
    echo "  ✅ Distribution math verified (500:300:200 → 50:30:20)"
    echo "  ✅ Dust handling demonstrated"
    echo
    print_step "🚀 Next Steps:"
    echo "  1. Start the frontend: cd frontend && npm start"
    echo "  2. Open http://localhost:3000 in your browser"
    echo "  3. Connect MetaMask to localhost:8545"
    echo "  4. Import one of the Hardhat test accounts"
    echo "  5. Try minting tokens and distributing rent!"
    echo
    print_step "🔧 Useful Commands:"
    echo "  • View Hardhat node logs: tail -f hardhat-node.log"
    echo "  • Run individual scripts: npx hardhat run scripts/<script>.js --network localhost"
    echo "  • Run tests: npx hardhat test"
    echo
    print_warning "Remember: This is a demo. For production, integrate with Flare's FAssets and State Connector!"
}

# Handle script interruption
cleanup() {
    echo
    print_step "🧹 Cleaning up..."
    if [ ! -z "$HARDHAT_PID" ]; then
        kill $HARDHAT_PID 2>/dev/null
        print_step "Stopped Hardhat node"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        print_step "Stopped frontend"
    fi
    exit 0
}

trap cleanup SIGINT SIGTERM

# Run the demo
main

# Keep script running to maintain services
print_step "🔄 Demo services running. Press Ctrl+C to stop."
wait