# arbitrum-airdrop-claimer
Claim $ARB airdrop of several wallets at the same time and transfer all tokens to one address

You need to have Node.js installed to run this script, download it here : https://nodejs.org/en  

In the env.json file put all your private key of your wallet eligible at the airdrop and put the address where you want to send all the $ARB tokens in cex. 

In the index.js file edit the number after ```concurrency``` (line 50) for the number of private keys you put in the env.json file  
   
Once installed & env.json file completed go in the folder with your command prompt and run :  
```npm i``` and 
```node index.js```
