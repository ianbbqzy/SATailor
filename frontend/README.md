# Run FE locally
```bash
cd frontend
npm config set legacy-peer-deps true
npm install
npm run start
```

# Run BE locally
First copy .env_template to .env, and fill in the secrets
```bash
pip install -r requirements.txt
uvicorn app.main:app --host=0.0.0.0 --port=8080
```
