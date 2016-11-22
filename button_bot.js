var Botkit = require('botkit');
var request = require('request');
var process = require('child_process');
var TestRail = require('node-testrail');
var json = require('./config.json');

var testrail = new TestRail(json.url, json.account, json.password);
var _bots = {};
var version = null;
var runId = null;
var runName = null;


var controller = Botkit.slackbot({
  interactive_replies: false,
  json_file_store: './db_slackbutton_bot/'
}).configureSlackApp(
  {
    clientId: json.clientId,
    clientSecret: json.clientSecret,
    scopes: ['bot']
  }
)

function trackBot(bot) {
  _bots[bot.config.token] = bot;
}

function startRTM(bot) {
  bot.startRTM(function(err) {
    if (!err) {
      trackBot(bot);
    }
  })
}

controller.setupWebserver('3000', function(err, webserver) {
  controller.createWebhookEndpoints(controller.webserver);
  controller.createOauthEndpoints(controller.webserver, function(err, req, res) {
    if (err) {
      res.status(500).send('ERROR: ' + err);
    }
    else {
      res.send('Success!');
    }
  })
})

controller.on('create_bot', function(bot, config) {
  if (_bots[bot.config.token]) {
  }
  else {
    startRTM(bot)
  }
})

controller.on('rtm_open', function(bot) {
  console.log('** The RTM api just connected!');
})

controller.on('rtm_close', function(bot, err) {
  console.log('/* --- Restarting bot ---- */');
  if (err) {
    console.error(err);
  }
  startRTM(bot);
})

controller.hears('^help', 'direct_message,direct_mention,mention', function(bot, message) { 
   bot.reply(message, {
    attachments: [{
      title: 'What do you want to do ?',
      callback_id: 'help',
      attachment_type: 'default',
      color: '#001405',
      actions: [
        {
          'name': 'buildJenkins',
          'value': 'buildJenkins',
          'text': 'Build Jenkins',
          'type': 'button'
        },
        {
          'name': 'jenkinsResult',
          'value': 'jenkinsResult',
          'text': 'Jenkins Result',
          'type': 'button'
        },
        {
          'name': 'testrailReport',
          'value': 'testrailReport',
          'text': 'Testrail Report',
          'type': 'button'
        }
      ]
    }]
  })
})

controller.on('interactive_message_callback', function(bot, message) {
  switch (message.actions[0].name) {
    case 'buildJenkins': {
      bot.replyInteractive(message, {
        attachments: [{
          title: 'Which task do you want to build ?',
          callback_id: 'interactive',
          attachment_type: 'default',
          color: '#001405',
          actions: [
            {
              'name': 'buildautotest',
              'value': 'autotest',
              'text': 'Auto Test',
              'type': 'button'
            },
            {
              'name': 'check_build_deploy',
              'value': 'check_build_deploy',
              'text': 'Check Build Deploy',
              'type': 'button'
            }
          ]
        }]
      })
      break;
    }

    case 'buildautotest': {
      buildJenkins(bot, message, message.actions[0].value)
      break;
    }

    case 'check_build_deploy': {
      buildJenkins(bot, message, message.actions[0].value)
      break;
    }
/*------------------------------------------------------------*/
    case 'jenkinsResult': {
       bot.replyInteractive(message, {
        attachments: [{
          title: 'Which result do you want to know ?',
          callback_id: 'interactive',
          attachment_type: 'default',
          color: '#001405',
          actions: [
            {
              'name': 'autotestresult',
              'value': 'autotest',
              'text': 'Auto Test',
              'type': 'button'
            }
          ]
        }]
      })
      break;
    }

    case 'autotestresult': {
      jenkinsResult(bot, message, message.actions[0].value)
      break;
    }
/*------------------------------------------------------------*/
    case 'testrailReport': {
       bot.replyInteractive(message, {
        attachments: [{
          title: 'Which report do you want to see ?',
          callback_id: 'interactive',
          attachment_type: 'default',
          color: '#001405',
          actions: [
            {
              'name': 'smoke',
              'value': 'smoke',
              'text': 'Smoke',
              'type': 'button'
            },
            {
              'name': 'integration',
              'value': 'integration',
              'text': 'Integration',
              'type': 'button'
            },
            {
              'name': 'automation',
              'value': 'automation',
              'text': 'Automation',
              'type': 'button'
            }
          ]
        }]
      })
      break;
    }

    case 'smoke': {
      testrail.getRuns(6, function(jsonString) {
        var testRun = JSON.parse(jsonString)
        runId = testRun[0].id
        runName = testRun[0].name
        bot.replyInteractive(message, {
          attachments: [
            {
              title: 'You can click here to check report-The smoke testrail report',
              title_link: 'https://ichef.testrail.com/index.php?/runs/view/' + runId,
              color: '#001405',
              callback_id: 'sign',
              actions: [
                {
                  'name': 'signoff',
                  'value': 'signoff',
                  'text': 'Sign Off',
                  'type': 'button',
                },
                {
                  'name': 'reject',
                  'value': 'reject',
                  'text': 'Reject',
                  'type': 'button',
                }
              ]
            }
          ]
        })
      })
      break;
    }

    case 'integration': {
      testrail.getRuns(3, function(jsonString) {
        var testRun = JSON.parse(jsonString)
        runId = testRun[0].id
        runName = testRun[0].name
        bot.replyInteractive(message, {
          attachments: [
            {
              title: 'You can click here to check report-The integration testrail report',
              title_link: 'https://ichef.testrail.com/index.php?/runs/view/' + runId,
              color: '#001405',
              callback_id: 'sign',
              actions: [
                {
                  'name': 'signoff',
                  'value': 'signoff',
                  'text': 'Sign Off',
                  'type': 'button',
                },
                {
                  'name': 'reject',
                  'value': 'reject',
                  'text': 'Reject',
                  'type': 'button',
                }
              ]
            }
          ]
        })
      })
      break;
    }

    case 'automation': {
      bot.replyInteractive(message, {
      attachments: [
        {
          title: 'You can click here to check report-The automation testrail report',
          title_link: 'https://ichef.testrail.com/index.php?/runs/view/7',
          color: '#001405',
        }
      ]
    })
      break;
    }

    default:
      break;
  }

  if (message.callback_id === 'sign') {
    const name = message.actions[0].name;
    const value = message.actions[0].value;
    var text = ''
    bot.api.channels.list({'exclude_archived' : 1}, function (err, res) {  
      //console.log(res);
    })
    if (name === 'signoff') {
      bot.say({
        text: '<@'+message.user+'> sign off ' + runName,
        channel: 'C2PAG152L'
      })
    } 
    else {
      bot.say({
        text: '<@'+message.user+'> didn\'t sign off ' + runName,
        channel: 'C2PAG152L'
      })
    }
  }
})
/*------------------------------------------------------------*/

controller.hears('','direct_message, direct_mention, mention', function (bot, message) {  
  bot.reply(message,'If you want to build jenkins or check the test report, you can use help!')
})

controller.on('message_received', function(bot, message) {
    bot.reply(message, 'You can use "help"')
})

/*------------------------------------------------------------*/

function buildJenkins(bot, message, jobName) {
  console.log(jobName);
  var jobUrl = 'http://192.168.5.1:8080/job/' + jobName + '/build?token=' + jobName;
  request(jobUrl, function () {
    if (jobName === 'autotest' || jobName === 'monkeytest' || jobName === 'check_build_deploy') {
      var str = 'OK! Let me build the ' + jobName
        bot.replyInteractive(message, str)
    } 
    else {
        bot.replyInteractive(message, 'Sorry, I can\'t find the ' + jobName + '. >_<!!')
    }
  })
}

function jenkinsResult(bot, message, jobName) {
  console.log(jobName)
  var jenkinsUrl = 'http://192.168.5.1:8080/job/' + jobName + '/lastBuild/testReport/api/json?pretty=true'
  request(jenkinsUrl, function(err, responce, body) {
    if (!err && responce.statusCode === 200) {
      var jenkinsBuildJson = JSON.parse(body)
      bot.replyInteractive(message, {
        attachments: [
          {
            title: 'The last build robot result of ' + jobName,
            title_link: 'http://192.168.5.1:8080/job/' + jobName + '/lastBuild/testReport',
            color: '#001405',
            fields: [
              {
                'title': 'Failed Cases',
                'value': jenkinsBuildJson.failCount,
                'short': true
              },
              {
                'title': 'Passed Cases',
                'value': jenkinsBuildJson.childReports[0].result.passCount,
                'short': true
              }
            ]
          }
        ]
      })
    }
    else {
      bot.replyInteractive(message, 'Some things was error')
    }
  })
}