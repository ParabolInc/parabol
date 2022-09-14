#!/bin/bash
openssl genrsa -out jira_privatekey.pem 1024
openssl req -newkey rsa:1024 -x509 -key jira_privatekey.pem -out jira_publickey.cer -days 365 -batch
openssl pkcs8 -topk8 -nocrypt -in jira_privatekey.pem -out jira_privatekey.pcks8
openssl x509 -pubkey -noout -in jira_publickey.cer  > jira_publickey.pem
openssl rand -base64 32 >consumerKey

echo
echo -----------------------------------
echo BEGIN SEND TO CLIENT
echo Consumer Key:
cat consumerKey
echo Consumer Name:
echo Parabol integration
echo Public Key:
cat jira_publickey.pem
echo
echo "Ask for their Jira Server URL, (ours is 'jira.parabol.co' for example)"
echo END SEND TO CLIENT
echo -----------------------------------
echo 
echo to run the mutation you need
echo "serverBaseUrl: <ASK CLIENT>"
echo "consumerKey: <see file consumerKey>"
echo "consumerSecret: <see file jira_privatekey.pem>"

