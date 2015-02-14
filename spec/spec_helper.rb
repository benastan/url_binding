require 'bundler'
Bundler.require
require 'capybara/webkit'
require 'capybara/rspec'
require 'app'
require 'pry'
require 'database_cleaner'

Capybara.app = App.new
Capybara.current_driver = :webkit

RSpec.configure do |config|
  config.before(:suite) do
    DatabaseCleaner.strategy = :truncation
    DatabaseCleaner.clean_with(:truncation)
  end

  config.after(:each) do 
    DatabaseCleaner.clean
  end
end
