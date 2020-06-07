
function Coin(Contract) {
    this.web3 = null;
    this.instance = null;
    this.Contract = Contract;
}

Coin.prototype.init = function() {

    this.web3 = new Web3(
        (window.web3 && window.web3.currentProvider) ||
        new Web3.providers.HttpProvider(this.Contract.endpoint));

    var contract_interface = this.web3.eth.contract(this.Contract.abi);

    this.instance = contract_interface.at(this.Contract.address);
};


Coin.prototype.showAddressBalance = function(hash, cb) {
    var that = this;

    var address = $("#balance-address").val();

    if(!isValidAddress(address)) {
        console.log("Invalid address");
        return;
    }

    this.getBalance(address, function(error, balance) {
        if(error) {
            console.log(error)
        }
        else {
            console.log(balance.toNumber());
                $("#message").text(balance.toNumber());
        }
    })
}

Coin.prototype.getBalance = function(address, cb) {
    this.instance.balances(address, function(error, result) {
        cb(error, result);
    })
}

Coin.prototype.createTokens = function() {
    var that = this;

    var address = $("#create-address").val();
    var amount = $("#create-amount").val();
    console.log(amount);

    if(!isValidAddress(address)) {
        console.log("Invalid address");
        return;
    }

    if(!isValidAmount(amount)) {
        console.log("Invalid amount");
        return;
    }

    this.instance.mint(address, amount, { from: window.web3.eth.accounts[0], gas: 100000, gasPrice: 100000, gasLimit: 100000 }, 
        function(error, txHash) {
            if(error) {
                console.log(error);
            }
            else {
                that.waitForReceipt(txHash, function(receipt) {
                    if(receipt.status) {
                        $("#create-address").val("");
                        $("#create-amount").val("");
                    }
                    else {
                        console.log("error");
                    }
                });
            }
        }
    )
}

Coin.prototype.waitForReceipt = function(hash, cb) {
    var that = this;

    this.web3.eth.getTransactionReceipt(hash, function(err, receipt) {
        if (err) {
            error(err);
        }
        if (receipt !== null) {
            if (cb) {
                cb(receipt);
            }
        } else {
            window.setTimeout(function() {
                that.waitForReceipt(hash, cb);
            }, 2000);
        }
    });
}

function isValidAddress(address) {
    return /^(0x)?[0-9a-f]{40}$/i.test(address);
}

function isValidAmount(amount) {
    return amount > 0 && typeof Number(amount) == 'number';    
}

Coin.prototype.bindButtons = function() {
    var that = this;

    $(document).on("click", "#button-create", function() {
        that.createTokens();
    });

    $(document).on("click", "#button-check", function() {
        that.showAddressBalance();
    }); 
}

Coin.prototype.onReady = function() {
    this.bindButtons();
    this.init();
};

if(typeof(Contracts) === "undefined") var Contracts={ Coin: { abi: [] }};
var coin = new Coin(Contracts['Coin']);

$(document).ready(function() {
    coin.onReady();
});
