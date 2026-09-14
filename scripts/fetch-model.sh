#!/usr/bin/env bash
set -euo pipefail
BASE="https://huggingface.co/SmilingWolf/wd-vit-tagger-v3/resolve/main"
mkdir -p models
curl -L --fail -o models/model.onnx "$BASE/model.onnx"
curl -L --fail -o models/selected_tags.csv "$BASE/selected_tags.csv"
