#!/bin/bash

# Automatic backup script for Serenity Plus
# Run this script to create timestamped backups

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/home/idolanuel/backups/serenity-plus"
PROJECT_DIR="/home/idolanuel/serenity-plus"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Create timestamped backup
echo "Creating backup: serenity-plus_$TIMESTAMP"
cp -r "$PROJECT_DIR" "$BACKUP_DIR/serenity-plus_$TIMESTAMP"

# Keep only last 10 backups
cd "$BACKUP_DIR"
ls -t | tail -n +11 | xargs -d '\n' rm -rf --

echo "Backup completed: serenity-plus_$TIMESTAMP"
echo "Backup location: $BACKUP_DIR/serenity-plus_$TIMESTAMP"


