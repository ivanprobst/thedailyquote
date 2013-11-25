thequotetribune
===============

tobd
* new quote -> update social stuff (social stuff should depend of templater, in case we look at a specific quote)
* share and tweet must use direct link
* direct link (users can't see after today, provide menu option for direct link)
* check quote tomorrow morning

tobf
* ie7+
* fb sharing caching
* fallback to override auto date switching (in case timers are messed up)
* fallback when no quote/author found
* final error pages (clear menu, link to go back home)
* url: when direct link does not exist, direct to home
* simplify scaling, too much js
* get out of js code: authorName, authorWikipediaRef, move wikipedia code to server side
* handle carriage return and links in quote txt
* clean data setting in quote and author

final
* run through ok if DB fails? where to keep error authors, in DB or author class? Use cases when quote/author missing
* clean npm in commits: http://blog.nodejitsu.com/package-dependencies-done-right
* setup prod env (better permissions on ec2, better EBS, db redundancy)
* setup sandbox env
* comment most of logs
* CLEAN AND REFILL THAT DB

admin enhanced
* prevent adding author with existing author_id
* quote/author update/creation feedback on browser
* authorID and pubDate duplicate check
* delete items
* schedule in red when a quote is there but is missing somehting (date, etc.)
* handle schedule duplicates


modules
* Twitter API: https://github.com/ttezel/twit
* HTTP calls: https://github.com/mikeal/request
* RSS: https://github.com/dylang/node-rss
* mongo: http://mongodb.github.io/node-mongodb-native/
(* jquery: https://github.com/coolaj86/node-jquery)
(* jsdom)
(* xmlhttprequest)
(* geoip: https://github.com/bluesmoon/node-geoip)

icons ref
* quote: <a href="http://thenounproject.com/noun/quote/#icon-No23118" target="_blank">Quote</a> designed by <a href="http://thenounproject.com/i" target="_blank">irene hoffman</a> from The Noun Project
* share: <a href="http://thenounproject.com/noun/network/#icon-No14269" target="_blank">Network</a> designed by <a href="http://thenounproject.com/gregpabst" target="_blank">Greg Pabst</a> from The Noun Project
* save: <a href="http://thenounproject.com/noun/paper-clip/#icon-No17647" target="_blank">Paper Clip</a> designed by <a href="http://thenounproject.com/tinyxl" target="_blank">Erin Standley</a> from The Noun Project
* mail: <a href="http://thenounproject.com/noun/mail/#icon-No994" target="_blank">Mail</a> designed by <a href="http://thenounproject.com/marchaumann" target="_blank">Marc Haumann</a> from The Noun Project
* twitter: <a href="http://thenounproject.com/noun/tweet/#icon-No16224" target="_blank">Tweet</a> designed by <a href="http://thenounproject.com/joe_harrison" target="_blank">Joe Harrison</a> from The Noun Project
* fb: <a href="http://thenounproject.com/noun/facebook/#icon-No20845" target="_blank">Facebook</a> designed by <a href="http://thenounproject.com/Luboš Volkov" target="_blank">Luboš Volkov</a> from The Noun Project
* rss: <a href="http://thenounproject.com/noun/rss/#icon-No16950" target="_blank">RSS</a> designed by <a href="http://thenounproject.com/mollybramlet" target="_blank">Molly Bramlet</a> from The Noun Project
* info: <a href="http://thenounproject.com/noun/information/#icon-No2824" target="_blank">Information</a> designed by <a href="http://thenounproject.com/somerandomdude" target="_blank">P.J. Onori</a> from The Noun Project