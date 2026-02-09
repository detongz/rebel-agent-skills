#!/bin/bash

###############################################################################
# MySkills Agent-to-Agent Payment Demo Script
#
# This script demonstrates the complete agent-to-agent payment flow on Monad
# testnet, including Smart Matching Engine, agent hiring, parallel work
# execution, and automatic payment settlement.
#
# Usage: ./agent-payment-demo.sh [options]
#   --fast      Skip delays for faster demo
#   --manual    Pause between steps for manual control
###############################################################################

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
FAST_MODE=false
MANUAL_MODE=false
NETWORK="Monad Testnet"
RPC_URL="https://testnet-rpc.monad.xyz"
EXPLORER_URL="https://testnet.monadvision.com"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --fast)
            FAST_MODE=true
            shift
            ;;
        --manual)
            MANUAL_MODE=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Helper functions
print_header() {
    echo -e "\n${PURPLE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║${NC}  $1"
    echo -e "${PURPLE}╚════════════════════════════════════════════════════════════╝${NC}\n"
}

print_step() {
    echo -e "\n${CYAN}━━━ Step $1 ━━━${NC}"
    echo -e "${BLUE}$2${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

wait_or_continue() {
    if [ "$FAST_MODE" = true ]; then
        sleep 0.5
    elif [ "$MANUAL_MODE" = true ]; then
        echo -e "\n${YELLOW}Press Enter to continue...${NC}"
        read
    else
        sleep 2
    fi
}

demo_typing() {
    local text="$1"
    local delay=${2:-0.03}

    for (( i=0; i<${#text}; i++ )); do
        echo -n "${text:$i:1}"
        sleep $delay
    done
    echo ""
}

###############################################################################
# Demo Start
###############################################################################

clear
print_header "MySkills Agent-to-Agent Payment Demo"
echo -e "${CYAN}Network: ${GREEN}$NETWORK${NC}"
echo -e "${CYAN}RPC: ${GREEN}$RPC_URL${NC}"
echo -e "${CYAN}Explorer: ${GREEN}$EXPLORER_URL${NC}"
wait_or_continue

###############################################################################
# Step 1: Agent A Receives Task
###############################################################################

print_step "1" "Agent A (Project Manager) Receives Task"

echo -e "${YELLOW}User Request:${NC}"
echo "┌─────────────────────────────────────────────────────────────┐"
echo "│ I need to audit this DeFi protocol before mainnet launch   │"
echo "│ Budget: 50 MON                                              │"
echo "│ Deadline: 24 hours                                          │"
echo "└─────────────────────────────────────────────────────────────┘"
wait_or_continue

###############################################################################
# Step 2: Smart Matching Engine Analysis
###############################################################################

print_step "2" "Smart Matching Engine Analysis"

echo -e "${PURPLE}🧠 Analyzing Requirements...${NC}"
echo ""

# Simulate NLP analysis
echo -e "${CYAN}Keywords detected:${NC}"
demo_typing "• security" 0.02
demo_typing "• audit" 0.02
demo_typing "• vulnerability" 0.02
demo_typing "• defi" 0.02
demo_typing "• smart contract" 0.02
echo ""

echo -e "${CYAN}Task type identified:${NC} ${GREEN}security-audit${NC}"
echo ""

echo -e "${CYAN}Querying MySkills Protocol...${NC}"
echo -e "• Registered skills: ${GREEN}147${NC}"
echo -e "• Active agents: ${GREEN}89${NC}"
echo -e "• Platform: all (claude-code, coze, manus, minimbp)"
wait_or_continue

echo -e "${PURPLE}📊 Multi-Dimensional Scoring...${NC}"
echo ""
echo "┌────────────────────┬──────────┬──────────┬──────────┬──────────┐"
echo "│ Agent              │ Relevance│ Success  │ Value    │ Total    │"
echo "├────────────────────┼──────────┼──────────┼──────────┼──────────┤"
echo "│ Security Scanner   │ ${GREEN}95%${NC}     │ ${GREEN}88%${NC}     │ ${GREEN}91%${NC}     │ ${GREEN}91.3${NC}    │"
echo "│ Fuzzer X           │ 88%      │ 92%      │ 88%      │ 88.3     │"
echo "│ Solidity Auditor   │ 90%      │ 85%      │ 87%      │ 87.3     │"
echo "│ Test Generator AI  │ 82%      │ 89%      │ 85%      │ 85.7     │"
echo "│ Gas Optimizer      │ 85%      │ 87%      │ 84%      │ 85.3     │"
echo "└────────────────────┴──────────┴──────────┴──────────┴──────────┘"
wait_or_continue

###############################################################################
# Step 3: Budget Optimization (Knapsack Algorithm)
###############################################################################

print_step "3" "Budget Optimization (Knapsack Algorithm)"

echo -e "${PURPLE}💰 Optimizing for budget: 50 MON${NC}"
echo ""
echo "Optimization goal: ${GREEN}security${NC}"
echo "Algorithm: ${CYAN}Greedy Knapsack Approximation${NC}"
echo ""

echo -e "${CYAN}Selected agents:${NC}"
echo "  1. Security Scanner Pro     - 30 MON (91.3 score)"
echo "  2. Fuzzer X                 - 15 MON (88.3 score)"
echo "  3. Code Review Bot          - 5 MON  (82.3 score)"
echo ""
echo -e "${GREEN}Total: 50 MON | Remaining: 0 MON${NC}"
wait_or_continue

###############################################################################
# Step 4: Agent A Hires Multiple Agents
###############################################################################

print_step "4" "Agent A Hires Multiple Agents"

echo -e "${PURPLE}🤝 Creating multi-agent coordination task...${NC}"
echo ""

echo "Task Details:"
echo "┌─────────────────────────────────────────────────────────────┐"
echo "│ Task ID: task-${RANDOM}                                     │"
echo "│ Title: DeFi Protocol Security Audit                        │"
echo "│ Budget: 50 MON                                             │"
echo "│ Status: ${GREEN}ASSIGNED${NC}                                               │"
echo "└─────────────────────────────────────────────────────────────┘"
echo ""

echo "Assigned Agents:"
echo "  🤖 Security Scanner Pro  → 30 MON (60%)"
echo "  🤖 Fuzzer X              → 15 MON (30%)"
echo "  🤖 Code Review Bot       → 5 MON  (10%)"
echo ""

print_success "All agents notified and ready to work"
wait_or_continue

###############################################################################
# Step 5: Parallel Work Execution
###############################################################################

print_step "5" "Agents Working in Parallel"

echo -e "${PURPLE}⚡ Parallel execution on 3 agents...${NC}"
echo ""

# Create parallel work simulation
echo -e "${CYAN}Agent 1: Security Scanner Pro${NC}"
demo_typing "  [████████████████] Analyzing bytecode..." 0.01
echo -e "  ${GREEN}✓ Found 2 critical vulnerabilities${NC}"
demo_typing "  [████████████████] Symbolic execution..." 0.01
echo -e "  ${GREEN}✓ Identified 3 high-severity issues${NC}"
echo ""

echo -e "${CYAN}Agent 2: Fuzzer X${NC}"
demo_typing "  [████████████████] Generating fuzz inputs..." 0.01
echo -e "  ${GREEN}✓ 10,000 test cases generated${NC}"
demo_typing "  [████████████████] Running fuzz tests..." 0.01
echo -e "  ${GREEN}✓ 0 edge case failures${NC}"
echo ""

echo -e "${CYAN}Agent 3: Code Review Bot${NC}"
demo_typing "  [████████████████] Analyzing code quality..." 0.01
echo -e "  ${GREEN}✓ Gas optimization: save 15%${NC}"
demo_typing "  [████████████████] Checking best practices..." 0.01
echo -e "  ${GREEN}✓ 4.8/5.0 rating${NC}"
echo ""

print_success "All agents completed their tasks"
wait_or_continue

###############################################################################
# Step 6: Results Aggregation
###############################################################################

print_step "6" "Results Aggregation & Verification"

echo "Aggregated Results:"
echo "┌─────────────────────────────────────────────────────────────┐"
echo "│ 📊 Security Audit Report                                   │"
echo "├─────────────────────────────────────────────────────────────┤"
echo "│ Critical Vulnerabilities: ${RED}2${NC}                                │"
echo "│ High Severity Issues:     ${YELLOW}3${NC}                                │"
echo "│ Medium Severity Issues:   ${YELLOW}5${NC}                                │"
echo "│ Gas Optimization:         ${GREEN}15% savings${NC}                     │"
echo "│ Code Quality Rating:      ${GREEN}4.8/5.0${NC}                          │"
echo "│ Fuzz Test Results:        ${GREEN}0 failures${NC}                        │"
echo "├─────────────────────────────────────────────────────────────┤"
echo "│ Overall Status:           ${GREEN}VERIFIED${NC}                          │"
echo "│ Report Hash:              ipfs://QmXyZ...3f7              │"
echo "└─────────────────────────────────────────────────────────────┘"
wait_or_continue

###############################################################################
# Step 7: Payment Settlement on Monad
###############################################################################

print_step "7" "💰 Payment Settlement on Monad"

echo -e "${PURPLE}⚡ Processing payments on Monad testnet...${NC}"
echo ""

# Simulate transaction
TX_HASH="0x$(openssl rand -hex 32)"
BLOCK=$(shuf -i 12000000-13000000 -n 1)

echo "Transaction Details:"
echo "┌─────────────────────────────────────────────────────────────┐"
echo "│ Network:          Monad Testnet                            │"
echo "│ Transaction:      $TX_HASH"
echo "│ Status:           ${GREEN}✓ Confirmed${NC}                               │"
echo "│ Block:            #${BLOCK}                                    │"
echo "│ Confirmation:     ${GREEN}0.3 seconds${NC}                               │"
echo "│ Gas Used:         0.0001 MON ($0.0002)                     │"
echo "└─────────────────────────────────────────────────────────────┘"
echo ""

echo "Payment Distribution:"
echo "┌─────────────────────────────────────────────────────────────┐"
echo "│ Total Budget:     50 MON                                   │"
echo "├─────────────────────────────────────────────────────────────┤"
echo "│ Security Scanner: 29.4 MON (98% of 30 MON)                 │"
echo "│ Fuzzer X:         14.7 MON (98% of 15 MON)                 │"
echo "│ Code Review:      4.9 MON  (98% of 5 MON)                  │"
echo "├─────────────────────────────────────────────────────────────┤"
echo "│ Platform Fee:     1 MON   (2% protocol fee)                │"
echo "└─────────────────────────────────────────────────────────────┘"
echo ""

print_success "All payments settled successfully on Monad!"
echo ""
echo -e "${CYAN}View transaction:${NC} $EXPLORER_URL/tx/$TX_HASH"
wait_or_continue

###############################################################################
# Step 8: Demo Summary
###############################################################################

print_step "8" "Demo Summary"

echo -e "${PURPLE}📊 Agent-to-Agent Payment Flow Complete!${NC}"
echo ""

echo "Key Metrics:"
echo "  • Total Time:        ~5 minutes (vs hours in traditional systems)"
echo "  • Confirmation Time: 0.3 seconds (vs 12+ seconds on Ethereum)"
echo "  • Gas Cost:          $0.001 (vs $50+ on Ethereum)"
echo "  • Agent Coordination: 3 agents working in parallel"
echo "  • Payment Split:     98/2 (creator/platform)"
echo ""

echo "What Makes This Possible:"
echo "  ${GREEN}✓${NC} Smart Matching Engine (AI-powered skill discovery)"
echo "  ${GREEN}✓${NC} Multi-dimensional scoring (relevance, success, cost)"
echo "  ${GREEN}✓${NC} Budget optimization (knapsack algorithm)"
echo "  ${GREEN}✓${NC} Parallel agent coordination"
echo "  ${GREEN}✓${NC} Monad blockchain (<1s confirmation, $0.001 gas)"
echo ""

echo -e "${CYAN}MySkills Protocol: Where AI Agents Hire and Pay Each Other${NC}"
echo ""

###############################################################################
# Demo End
###############################################################################

print_header "Demo Complete!"

echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Try the interactive demo: demo/agent-to-agent-payment.html"
echo "  2. Explore the MCP server: packages/mcp-server/"
echo "  3. View transactions on Monad explorer"
echo "  4. Build your own agent skills!"
echo ""

echo -e "${CYAN}Links:${NC}"
echo "  • GitHub: https://github.com/detongz/agent-reward-hub"
echo "  • Demo: demo/agent-to-agent-payment.html"
echo "  • Explorer: $EXPLORER_URL"
echo ""

exit 0
