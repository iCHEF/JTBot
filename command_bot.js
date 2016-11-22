var Botkit = require('botkit');
var request = require('request');
var controller = Botkit.slackbot();
var process = require('child_process');


var bot = controller.spawn({
  token: 'xoxb-85944343712-c3P4Zm71lr8HdVs06VmSXXwu',
  retries: 500
});

function startRTM() {
  bot.startRTM(function(err) {
    if (err) {
      throw new Error(err);
    }
  });
}

controller.hears('^hello','direct_message,direct_mention,mention',function(bot, message) {
  bot.reply(message, 'Hello <@'+message.user+'>');
});

controller.hears(['call me (.*)', 'my name is (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    var name = message.match[1];
    controller.storage.users.get(message.user, function(err, user) {
        if (!user) {
            user = {
                id: message.user,
            };
        }
        user.name = name;
        controller.storage.users.save(user, function(err, id) {
            bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.');
        });
    });
});

controller.hears('^help', 'direct_message,direct_mention,mention', function(bot, message) { 
    var reply_with_attachments = {
        "attachments": [
            {
              "pretext": "Here are all commands.",
              "color": "#36a64f",
              "fields": [
                  {
                      "title": "build deploy",
                  },
                  {
                      "title": "test [job name]",
                  },
                  {
                      "title": "my name is [your name]",
                  },
                  {
                      "title": "get [job name] result",
                  }
              ]
            }
        ]
    }
       // console.log(JSON.stringify(reply_with_attachments))
        bot.reply(message, reply_with_attachments)
});

controller.hears('^build deploy', 'direct_message,direct_mention,mention',function(bot,message) {
  var job_name = 'Check_Build_Deploy';
  console.log(job_name)
  var job_url = 'http://192.168.5.1:8080/job/'+job_name+'/build?token=build_deploy';
  request(job_url, function () {
          var str = 'OK! Let me build the '+job_name
          bot.reply(message, str)
    })
})

controller.hears('^test (.*)', 'direct_message,direct_mention,mention',function(bot,message) {
  var job_name = message.match[1].toLowerCase();
  console.log(job_name)
  var job_url = 'http://192.168.5.1:8080/job/'+job_name+'/build?token='+job_name;
  request(job_url, function () {
        if (job_name == 'autotest' || job_name =='monkeytest') {
          var str = 'OK! Let me test the '+job_name
          bot.reply(message, str)
        } 
        else {
          bot.reply(message, 'Sorry, I can\'t find the '+job_name+'. >_<!!')
        }
    })
})

controller.hears('^get (.*) result','direct_message,direct_mention,mention',function(bot, message) {
  var job_name = message.match[1].toLowerCase();
  var jenkins_url = 'http://192.168.5.1:8080/job/'+job_name+'/lastBuild/testReport/api/json';
  request(jenkins_url, function(error, responce, body) {
    if(!error && responce.statusCode === 200) {
      var jenkinsBuildJson = JSON.parse(body);
      var reply_with_attachments = {
        "attachments": [
                {
                    "fallback": "Required plain-text summary of the attachment.",
                    "color": "#55699e",
                    "title": "The last build robot result of " + job_name,
                    "title_link": 'http://192.168.5.1:8080/job/'+job_name+'/lastBuild/testReport',
                    "fields": [
                        {
                            "title": "Failed Cases",
                            "value": jenkinsBuildJson.failCount,
                            "short": true
                        },
                        {
                            "title": "Passed Cases",
                            "value": jenkinsBuildJson.childReports[0].result.passCount,
                            "short": true
                        },
                    ]
                }
            ]
      }
      bot.reply(message, reply_with_attachments)
    }
  })
})

controller.hears('','direct_message,direct_mention,mention',function(bot,message) {  
   bot.reply(message,'Fuck you!');
   bot.reply(message,'You can use "help"');
})

/*
 * Start RTM
 */
startRTM();

/*
 * Autorestart RTM
 */
controller.on('rtm_close', startRTM);

