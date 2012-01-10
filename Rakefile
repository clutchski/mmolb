
def lint(config, dirs)
  cmds = [
    "./node_modules/.bin/jshint",
    dirs.map {|d| "#{d}/*.js"}.join(" "),
    "--config",
    config
  ]
  sh cmds.join(" ")
end

# Print a notice message.
def notify(message)
  padding = 4
  line = '*' * (message.length + padding)
  puts line
  puts "* #{message.upcase} *"
  puts line
end

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
  lint("jshint.client.json", ["assets/javascripts"])
  notify("client linted")

  lint("jshint.server.json", [".", "routes", "services"])
  notify("server linted")
end

task :default => :run