# Session Feedback Demo System

## Installation instructions

- Fork the repository into your account.
- For your backend:
  - Go to [/serverless](https://github.com/ziniman/aws-session-feedback/tree/master/serverless) folder.
  - Add a rds_config file with the next parameters:
   ```
   rds_host  = [your_rds_host]
   db_username = [your_rds_db_username]
   db_password = [your_rds_db_password]
   db_name = [your_rds_db_name]
   ```
   In case you want to use RDS Proxy add:
   ```
   proxy_host = [your_rds_proxy_endpoint]
   ```

  - Deploy your serverless backend with ```sls deploy``` from the serverless folder
- For your frontend:
  - Set a new Amazon Amplify Console app in your account and point it to your repo.
  - Go to Environment variables setup of your new app and add a new variable named ```REACT_APP_BACKEND_API``` with the API domain and prefix (e.g. ```https://xxx.execute-api.eu-west-1.amazonaws.com/dev```)
- Final stage
  - Commit and push your code to your repo so Amazon Amplify will push an updated version of your code to the front end.
