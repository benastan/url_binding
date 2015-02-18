ENV['URL_STREAM_URL'] = 'http://127.0.0.1:4000/events'
ENV['DATABASE_URL'] = 'postgres://localhost/url_binding_test'

require 'bundler'
Bundler.require
require 'capybara/webkit'
require 'capybara/rspec'
require 'capybara-puma'
require 'app'
require 'pry'
require 'database_cleaner'

Capybara.app = App
Capybara.server_port = 4000
Capybara.current_driver = :selenium

RSpec.configure do |config|
  config.before(:suite) do
    DatabaseCleaner.strategy = :truncation
    DatabaseCleaner.clean_with(:truncation)
  end

  config.after(:each) do 
    DatabaseCleaner.clean
  end
end
