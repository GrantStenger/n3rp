# N3RP: NFT Rental Protocol


## Introduction
The NFT Rental Protocol (N3RP) allows owners to rent out their NFTs for a specified time period in exchange for payment. Do your NFTs give you access to exclusive events you can't attend? NLP compensates your for your fomo with ETH payments while temporary borrowers get the chance of flexing flashy blue chips. 

My intention is to implement the functionality for [standard leases](https://en.wikipedia.org/wiki/Lease) applied in the context of digital assets (specifically [ERC721 tokens](https://docs.openzeppelin.com/contracts/4.x/api/token/erc721)).


## Motivation

Token-gated event access is becoming an increasingly attractive and reliable pathway for the everyday crypto-user to attend events like concerts, parties, and conferences. The trouble is, while token-gated event access guarantees the owner access to a given event, it only guarantees the owner access. This is suboptimal in the following sense: in the case that the owner is unable to attend the event, he cannot easily lend it to a potential attendee for a suitable period of time (say, for the duration of the event). To bring this dynamic to light, consider the following hypothetical situation.

Alice has lifetime season tickets to the games of her favorite sports team, represented as NFT #2a (her seat) from the Warriors collection created by NBA Labs. Bob would love to borrow Alice’s ticket to see the game, but doesn’t want to pay for season tickets. In this case, Alice would require a payment and the assurance that Bob will return the tickets to her. 

How can these strangers coordinate this transaction safely? Alice can either transfer ownership to Bob or she can keep it for herself. In the first case, Alice has no guarantee that Bob will transfer ownership back to her after the game. In the second case, Bob can’t enter the stadium. Even if Alice shares her private keys with Bob, Hacker Hank might be listening and steal her ticket or Bob himself might maliciously steal her assets. In either case, it seems that temporary ownership strategies fall short. Within the constraints of the ERC 721 standard, assigning temporary ownership is impossible. 


## Mechanism
1. A lender and borrower must both consent into the following contract
2. The borrower wants to be able to lease a specific NFT for a predefined period of time
3. Require that the lender owns the NFT
4. In exchange for leasing out their NFT, the lender receives an initial lump sum payment
5. The lender additionally requires collateral to be put up to prevent the borrower from rugging
6. Require that the borrower has the initial sum and the collateral before proceeding
7. If the borrower steals, sells, or loses the NFT or is otherwise unable to return it, the collateral is paid to the lender daily in high interest payments until the NFT is return or the collateral is depleted 
8. If the borrower returns the NFT before their agreed upon expiration, their collateral is returned and the contract is terminated

## Development 

### Set up 
```
git clone https://github.com/gstenger98/nft-leasing
git submodule update --init --recursive ## install dependencies
forge build
```

### Test 

```
forge test
```

### Lint 
```
npm install 
npm run lint 
```


## Questions
1. Is collateral required? If the NFT needs to be transfered to the borrower's EOA then collateral is likely required. 
1. Are all my functions/variables properly scoped?
2. Do I use memory/storage in the correct places?
3. Which functions need to be payable?
    payable if you want to get money from the sender
    on the function that the borrower calls to put up their collateral (call a payable function with a certain amt)
    how would the contract send money back?
        not payable (only when function receives money)
        payable(address sending to).call({value: amt})
4. Am I using immutable correctly?
5. Do I use SafeMath/PRBMathSD59x18 in the correct places?
6. What license should I use for this? MIT? GPL-3.0? Unliscence?
7. Are there other error conditions I should consider?
8. Who calls this contract? How do we make sure both parties consent to this agreement?
9. What are clearest variable names?
    a. originalOwner vs lenderAddress?
    b. temporaryOwner vs borrowerAddress?
    c. expiry vs expirationTime?
    d. costToLease vs initialPayment?
10. How can this be exploited?
11. Should the LeaseNFT contract be abstract or should I implement each of the ERC721 functions?
12. How could we accept other forms of collateral other than ETH?
13. Users shouldn't have to redeploy this contract everytime they want to create a lease. Create a Lease struct
    containing the relevant information for each lender-borrower-nft object and make a map of all live leases.
    The drawback of this is that everyone relies on the same contract, so if anything breaks risk/security is 
    spread across all users. The benefits is that it'll be cheaper for uses because they won't have to redeploy.

## To Do's:
1. Write tests
2. Answer all of the above questions
3. Add renew lease functionality
4. Encode payment methods other than lump sum (periodic payments being an obvious alternative)
5. Add auction structure where potential borrowers place bids for NFTs they'd like to borrow over specified time periods