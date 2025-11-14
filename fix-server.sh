#!/bin/bash
echo "🔧 Arreglando servidor..."
lsof -ti:5000 | xargs kill -9 2>/dev/null || true
sleep 2
echo "✅ Listo! Servidor limpio"
npm run dev -- --host 0.0.0.0
