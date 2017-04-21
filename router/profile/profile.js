var express = require('express');
var app = express();
var router = express.Router();
var path = require('path');
var options = require('../option');
var mysql = require('mysql');

var id = "'ma'";

var loginData = {
  host: options.storageConfig.HOST,
  user: options.storageConfig.user,
  password: options.storageConfig.password
};

var connection = mysql.createConnection({
  host: loginData.host,
  port: 3306,
  user: loginData.user,
  password: loginData.password,
  database: 'octodog',
  multipleStatements: true
})
connection.connect();

router.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '../../public/html/profile.html'));
})

router.post('/user', function(req, res){
  var responseData = {};
  var temp;
  var query = "select `email`,`id`,`img` from user where id=" + id + ";" +
      "select score from scoreboard where uid=" + id + " ORDER BY num DESC limit 5;" +
      "select count(*) from scoreboard where uid=" + id + ";" +
      "select `score`,(select count(*)+1 from scoreboard where score>t.score) AS rank from scoreboard AS t where `uid`="+ id + " ORDER BY rank asc limit 1;";

  connection.query(query, function(err,rows){
    // user 정보 - email, id, img, play, rank, topscore, totalscore
    responseData = {
      user:{},
      chartscore:[]
    };
    if(err) throw err;

    // user 데이터 처리
    responseData.user =  rows[0][0];

    // chart에 사용될 score 데이터 처리
    rows[1].forEach(function(val){
      responseData.chartscore.push(val.score);
    })

    // 플레이 횟수 처리
    temp = rows[2][0]
    responseData.user.play = temp["count(*)"];

    // 현재 까지 모은 총 score 처리
    var sum = responseData.chartscore.reduce(function(a,b){
      return a+b;
    })
    responseData.user.totalscore = sum;

    // 랭크 처리
    temp = rows[3][0];
    responseData.user.rank = temp.rank;
    responseData.user.topscore = temp.score;


    res.json(responseData);
  });
});

module.exports = router;
