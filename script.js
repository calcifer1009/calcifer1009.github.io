var contractAddress = '0x89a80592ca3b2e62181e643fc7ee5b1acdf1fd21';
var abi = [
    {
        "constant": false,
        "inputs": [
            {
                "name": "addr",
                "type": "string"
            },
            {
                "name": "carKind",
                "type": "string"
            }
        ],
        "name": "CreateMember",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "addr",
                "type": "string"
            },
            {
                "name": "x",
                "type": "uint256"
            }
        ],
        "name": "UpdateStatus",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "addr",
                "type": "string"
            }
        ],
        "name": "GetStatus",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "GetTotalMember",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "GetTotalTransaction",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
];
var smartCarzuaContract;
var smartCarzua;

window.addEventListener('load', function() {

    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
        // Use Mist/MetaMask's provider
        window.web3 = new Web3(web3.currentProvider);
    } else {
        console.log('No web3? You should consider trying MetaMask!')
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }
    // Now you can start your app & access web3 freely:
    startApp();
});

function startApp() {
    smartCarzuaContract = web3.eth.contract(abi);
    smartCarzua = smartCarzuaContract.at(contractAddress);
    document.getElementById('contractAddr').innerHTML = getLink(contractAddress);
    web3.eth.getAccounts(function(e,r){
        document.getElementById('accountAddr').innerHTML = getLink(r[0]);
    });

    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(getValue);
}

function getLink(addr) {
    return '<a target="_blank" href=https://testnet.etherscan.io/address/' + addr + '>' + addr +'</a>';
}

function getValue() {
    smartCarzua.GetTotalMember(function(e,r){
        document.getElementById('totalMember').innerHTML=r.toNumber();


    });
    web3.eth.getBlockNumber(function(e,r){
        document.getElementById('lastBlock').innerHTML = r;
    });

    smartCarzua.GetTotalTransaction(function(e,r){
        document.getElementById('totalTransaction').innerHTML=r.toNumber();
    });

    drawVisualization();
}

function SetMemberInfo() {
    var userID = document.getElementById('carOwner_Change').value;
    var newDist = document.getElementById('additionalDriving_Change').value;

    var txid;

    smartCarzua.UpdateStatus(userID, newDist, function(e,r){
        document.getElementById('updateInfo').innerHTML = 'Transaction id: ' + r + '<span id="pending" style="color:red;">(Pending)</span>';
        txid = r;
    });
    var filter = web3.eth.filter('latest');
    filter.watch(function(e, r) {
        getValue();
        GetMemberInfo(userID);
        web3.eth.getTransaction(txid, function(e,r){
            if (r != null && r.blockNumber > 0) {
                document.getElementById('pending').innerHTML = '(기록된 블록: ' + r.blockNumber + ')';
                document.getElementById('pending').style.cssText ='color:green;';
                filter.stopWatching();
            }
        });
    });
}


function drawVisualization() {
    var car_data = google.visualization.arrayToDataTable([
        ['a','b','c'],
        ['Avante',123,323],
        ['Sonata',222,333]
    ]);

    var node_data = google.visualization.arrayToDataTable([
        ['a','b'],
        ['Avante',123],
        ['Sonata',222],
        ['adfa',222]
    ]);

    var car_kind_options= {
        title: '등록 차량 종류',
        vAxis: {title:'ratio'}
    };

    var car_driving_options= {
        title: '차량 주행거리',
        vAxis: {title:'km'}
    };

    var node_options= {
        title: '일일 Transaction 수',
        vAxis: {title:'count'},
        seriesType: 'bars',
        series: {2: {type:'line'}}
    };

    var chart_car_kind = new google.visualization.PieChart(document.getElementById('chart_car_kind'));
    chart_car_kind.draw (car_data, car_kind_options);
    var chart_car_driving = new google.visualization.ComboChart(document.getElementById('chart_car_driving'));
    chart_car_driving.draw (car_data, car_driving_options);
    var chart_node = new google.visualization.ComboChart(document.getElementById('chart_node'));
    chart_node.draw (node_data, node_options);
}


function GetMemberInfo(){
    var memberID;
    if(arguments.length > 0){
        memberID = arguments[0];
    }
    else{
        memberID = document.getElementById('memberIDInput').value;
    }
    smartCarzua.GetStatus(memberID, function(e,r){
        document.getElementById('carOwner').innerHTML = memberID;
        document.getElementById('carInfo').innerHTML = "Avante";
        document.getElementById('carTotalDriving').innerHTML = r.toNumber();
    });
}


