# Run FE locally
# set backend URL to be `http://localhost:8080` in `frontend/.env`
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
```bash
eb deploy
```
Restore the environment seerlight-dev on the aws console (or create a new one with `eb create`)

## self sign certificate
https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/configuring-https-ssl.html
https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/configuring-https-ssl-upload.html
https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/configuring-https-elb.html

# Deploy FE
# set backend URL to be the AWS URL in `frontend/.env`
```bash
npm run predeploy
npm run deploy
```
https://github.com/gitname/react-gh-pages