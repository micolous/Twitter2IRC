var tn = require("twitter-node");
var irc = require("irc");
var sys = require("sys");

var twitter_user = "<user>";
var twitter_password = "<password>";
var twitter_tags = ["<tag1>","<tag2>"];
var irc_server = "<server>";
var irc_channels = ["<channel1>","<channel2>"];
var irc_nick = "<nick>";

var client = new irc.Client(irc_server, irc_nick, { channels: irc_channels });
client.addListener("message", function(from, to, message) {
  sys.puts(from + " => " + to + ": " + message);
});

client.addListener("error", function(error) {
  console.log("IRC Error: " + error.message);
});

var twit = new tn.TwitterNode({ user: twitter_user, password: twitter_password });
for (var i in twitter_tags)
{
  twit.track(twitter_tags[i]);
}

twit.addListener("error", function(error) {
  console.log("Twitter Error: " + error.message);
});

twit.addListener("tweet", function(tweet) {
  /*
   * Added "filtering out" of omgubuntu-related items.
   * The reason for this is because the guy who runs the @omgubuntu site has 
   * about 20 accounts, tweets from all of them identically and simultaneously,
   * and doesn't retweet "correctly" meaning it floods out the bot.
   *
   * I'll remove this after @omgubuntu learns corrects this issue and contacts me.
   * (Even "old media" don't do stupid shit like this, btw.)
   *  ~micolous (2011-01-29)
   */
  if (
    !tweet.text.match(/RT/i) && 
    !tweet.text.match(/omgubuntu/i) &&
    !tweet.text.match(/retweetubuntu/i) &&
    !tweet.user.screen_name.match(/omgubuntu/i) &&
    !tweet.user.screen_name.match(/retweetubuntu/i)
  ) {
    sys.puts("@" + tweet.user.screen_name + " says: " + tweet.text);
    for (var i in irc_channels)
    {
      client.say(irc_channels[i], "\x02\x034@\x03\x032" + tweet.user.screen_name + "\x03 says:\x02 " + tweet.text);
    }
  }
});

twit.addListener("limit", function(limit) {
  sys.puts("LIMIT: " + sys.inspect(limit));
});

twit.addListener("delete", function(del) {
  sys.puts("DELETE: " + sys.inspect(del));
});

twit.addListener("end", function(resp) {
  sys.puts("END: " + resp.statusCode);
});

twit.stream();
