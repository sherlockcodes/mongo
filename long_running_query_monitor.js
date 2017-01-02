//create shell script file with below and put it in crontab.
//mongo --quiet long_running_query_monitor.js > mongo_slow_query_$(date +\%Y\%m\%d\%H\%M\%S).log
long_running_queries = {}
MAX_RUNNING_TIME = 10 //in seconds
slow_queries = []
db.currentOp().inprog.forEach(
  function(op) {
    if(op.secs_running >= MAX_RUNNING_TIME) {
    	long_running_queries[op.opid] = {"ns":op.ns, "op":op.op, "running_time":op.secs_running, "query":op.query, "client":op.client}
    }	
  }
)

for(a in long_running_queries){
	slow_queries.push([a,long_running_queries[a]])
}
slow_queries.sort(function(a,b){return a[1].running_time - b[1].running_time});
slow_queries.reverse();	
if(slow_queries.length>0){
	for(i=0;i<slow_queries.length;i++){
		text = (new Date()).toString() + ' client ' + slow_queries[i][0] + ' ' + slow_queries[i][1]['ns'] + ' taking ' + slow_queries[i][1]['running_time'] + ' seconds for query ' ;
		if(slow_queries[i][1]['query']){
			text += JSON.stringify(slow_queries[i][1]['query']);
		}  
		printjson(text)
	}
}
