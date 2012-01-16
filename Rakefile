
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

desc 'Run tests.'
task :test do
  ENV['MONGOLAB_URI'] = "mongo://localhost/lumiere-test"
  sh("node_modules/.bin/vows tests/* --spec")
end

desc 'Run the app.'
task :run do
  ENV['MONGOLAB_URI'] = "mongo://localhost/lumiere-dev"
  sh("node server.js")
end

desc 'Run the app in prod mode.'
task :prod do
  ENV["NODE_ENV"] = "production"
  sh("node server.js")
end

desc 'Lint the code'
task :lint do
  lint("jshint.client.json", ["app/assets/javascripts"])
  notify("client linted")

  lint("jshint.server.json", [".", "tests", "app/routes", "app/services"])
  notify("server linted")
end

task :dist => [:lint, :test]

task :default => :run
