
desc 'Clean up artifacts.'
task :clean do
  sh("rm -rf builtAssets")
end

desc 'Run the app.'
task :run do
  sh("node app.js")
end

desc 'Run the app in prod mode.'
task :prod do
  sh("NODE_ENV=production node app.js")
end

desc 'Lint the code'
task :lint do
  dirs = [
    "assets/javascripts",
    ".",
    "routes",
    "services"
  ]
  paths = dirs.map {|d| "#{d}/*.js"}.join(" ")
  sh("./node_modules/.bin/jshint #{paths}")
end

task :default => :run
