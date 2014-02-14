var config = {}

config.db = process.env.DB || 'mongodb://localhost:27017/testtribune';
config.port = process.env.PORT || 8134;
config.adminport = 8125;
config.extensionmap = {
	".png":"image/png",".jpg":"image/jpg",".gif":"image/gif",".ico":"image/x-icon",
	".js":"text/javascript",".css":"text/css",
	".html":"text/html"
};
config.transitiontime = 6; // UCT quote transition time

config.log = {};
config.log.indexfile = 'logs/index.log';
config.log.errorfile = 'logs/error.log';
config.log.adminfile = 'logs/admin.log';

config.rss = {"title":'The Quote Tribune',"description":"Your daily inspirational fix","feed_url":"http://thequotetribune.com/rss.xml","site_url":"http://thequotetribune.com"};

config.twitter = {};
config.twitter.consumer_key = 'CoNoEzyQ5OqXv2PkAxA';
config.twitter.consumer_secret = 'ESTtXkBGGFH8rxZPHMENC3TRoRNlUsUO7lP4pWlvSU';
config.twitter.access_token = '2164553251-5GdLiB1qs4VB1fHHlfy26HkkLDpHRRJy2rgaW3Z';
config.twitter.access_token_secret = 'HdRkfoP2jW7D7I5FKFepWoBlRBfv8Zqx0EFwCAlJi3du7';

config.facebook = {};
config.facebook.url = 'https://graph.facebook.com/1410710079162036/links';
config.facebook.token = 'CAAB7sDUrcSIBAH4C9U8ZBZBjZCmL4T9ltxifkidZCOHUI2YP7DZCpyW1Os22MAPqjfuL0XKVcX8X86q2ZC6LDOZCeEc6LQeZAw0iACSUNOdSIAD6cvow3Ni1fV4BsjCE5boRDLXoMVZBVSxiZBxEi8CUYCRf2xpp2wJ5rErHaOmBV8ijrdpe5q9usT';

module.exports = config;