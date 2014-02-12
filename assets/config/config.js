var config = {}

config.db = process.env.DB || 'mongodb://localhost:27017/thequotetribune';
config.port = process.env.PORT || 8124;

config.twitter = {};
config.twitter.consumer_key = 'CoNoEzyQ5OqXv2PkAxA';
config.twitter.consumer_secret = 'ESTtXkBGGFH8rxZPHMENC3TRoRNlUsUO7lP4pWlvSU';
config.twitter.access_token = '2164553251-5GdLiB1qs4VB1fHHlfy26HkkLDpHRRJy2rgaW3Z';
config.twitter.access_token_secret = 'HdRkfoP2jW7D7I5FKFepWoBlRBfv8Zqx0EFwCAlJi3du7';

config.facebook = {};
config.facebook.url = 'https://graph.facebook.com/1410710079162036/links';
config.facebook.token = 'CAAB7sDUrcSIBAH4C9U8ZBZBjZCmL4T9ltxifkidZCOHUI2YP7DZCpyW1Os22MAPqjfuL0XKVcX8X86q2ZC6LDOZCeEc6LQeZAw0iACSUNOdSIAD6cvow3Ni1fV4BsjCE5boRDLXoMVZBVSxiZBxEi8CUYCRf2xpp2wJ5rErHaOmBV8ijrdpe5q9usT';

module.exports = config;