thequotetribune
===============

tobd
* quote preview (in schedule + at creation)
* time the quote request and social updates

tobf
* CREATE A QUOTE + A DB MODULE
* better sharing button
* scrolling fallback when resolution too small
* check that all classic resolutions are good
* simplify scaling, too much js
* ie7+
* fb sharing caching
* get out of js code: authorName, authorWikipediaRef, move wikipedia code to server side
* fallback to override auto date switching (in case timers are messed up)
* fallback when no quote/author found
* final error page
* quote font size support

final
* clean npm in commits: http://blog.nodejitsu.com/package-dependencies-done-right
* setup prod env (better permissions on ec2, better EBS, db redundancy)
* setup sandbox env
* CLEAN AND REFILL THAT DB

maybe
* crashed admin shouldn't crash prod
* complete tz mapping
* handle carriage return in quote txt

admin enhanced
* prevent adding author with existing author_id


offset voodoo: max ratio of 0.45

modules
* Twitter API: https://github.com/ttezel/twit
* HTTP calls: https://github.com/mikeal/request
* RSS: https://github.com/dylang/node-rss
* mongo: http://mongodb.github.io/node-mongodb-native/
* geoip: https://github.com/bluesmoon/node-geoip

icons ref
* quote: <a href="http://thenounproject.com/noun/quote/#icon-No23118" target="_blank">Quote</a> designed by <a href="http://thenounproject.com/i" target="_blank">irene hoffman</a> from The Noun Project
* share: <a href="http://thenounproject.com/noun/network/#icon-No14269" target="_blank">Network</a> designed by <a href="http://thenounproject.com/gregpabst" target="_blank">Greg Pabst</a> from The Noun Project
* save: <a href="http://thenounproject.com/noun/paper-clip/#icon-No17647" target="_blank">Paper Clip</a> designed by <a href="http://thenounproject.com/tinyxl" target="_blank">Erin Standley</a> from The Noun Project
* mail: <a href="http://thenounproject.com/noun/mail/#icon-No994" target="_blank">Mail</a> designed by <a href="http://thenounproject.com/marchaumann" target="_blank">Marc Haumann</a> from The Noun Project
* twitter: <a href="http://thenounproject.com/noun/tweet/#icon-No16224" target="_blank">Tweet</a> designed by <a href="http://thenounproject.com/joe_harrison" target="_blank">Joe Harrison</a> from The Noun Project
* fb: <a href="http://thenounproject.com/noun/facebook/#icon-No20845" target="_blank">Facebook</a> designed by <a href="http://thenounproject.com/Luboš Volkov" target="_blank">Luboš Volkov</a> from The Noun Project
* rss: <a href="http://thenounproject.com/noun/rss/#icon-No16950" target="_blank">RSS</a> designed by <a href="http://thenounproject.com/mollybramlet" target="_blank">Molly Bramlet</a> from The Noun Project
* info: <a href="http://thenounproject.com/noun/information/#icon-No2824" target="_blank">Information</a> designed by <a href="http://thenounproject.com/somerandomdude" target="_blank">P.J. Onori</a> from The Noun Project