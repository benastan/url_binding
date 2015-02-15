require 'bundler'
Bundler.require
require 'capybara/webkit'
require 'capybara/rspec'
require 'capybara-puma'
require 'app'
require 'pry'
require 'database_cleaner'

Capybara.app = App
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
