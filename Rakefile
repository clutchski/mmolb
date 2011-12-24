
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

task :default => :run
