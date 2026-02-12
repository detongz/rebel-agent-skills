#!/bin/bash

# Continuous work script for pitch deck implementation
# This script will continuously analyze and implement pitch deck features

LOG_FILE="pitch-work-log.txt"

echo "=== Starting continuous work loop ===" | tee -a "$LOG_FILE"
echo "Start time: $(date)" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

while true; do
    echo "========================================" | tee -a "$LOG_FILE"
    echo "New cycle: $(date '+%Y-%m-%d %H:%M:%S')" | tee -a "$LOG_FILE"
    echo "" | tee -a "$LOG_FILE"

    # Call Claude to do work
    echo "Calling Claude..." | tee -a "$LOG_FILE"
    claude --dangerously-skip-permissions -p "Analyze feat/moltiverse-openclaw branch code, compare with live demo and pitch deck goals, identify gaps and implement missing features." >> "$LOG_FILE" 2>&1

    # Check result of last call
    EXIT_CODE=$?
    if [ $EXIT_CODE -eq 0 ]; then
        echo "✓ Claude work completed successfully" | tee -a "$LOG_FILE"
    else
        echo "✗ Claude work encountered error (exit code: $EXIT_CODE)" | tee -a "$LOG_FILE"
    fi

    # Wait before continuing
    echo "" | tee -a "$LOG_FILE"
    echo "Waiting 30 seconds before continuing..." | tee -a "$LOG_FILE"
    sleep 30
done
