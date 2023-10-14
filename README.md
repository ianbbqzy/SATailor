# Run FE locally
```bash
cd frontend
npm config set legacy-peer-deps true
npm install
npm run start
```

# Run BE locally
First copy .env_template to .env, and fill in the secrets
also create `backend/app/firebaseServiceAccountKey.json` (ask ian for one for now or set up your own firebase project)
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host=0.0.0.0 --port=8080
```

# Run BE on aws
Restore the environment seerlight-dev4 on the aws console (or create a new one with `eb create`)
then swap "localhost:8080" with "seerlight-dev4.us-east-2.elasticbeanstalk.com"
