require 'sinatra/base'
require 'pry'
require 'sequel'
require 'pathname'

class App < Sinatra::Base
  get '/' do
    haml :index
  end

  get '/events' do
    content_type 'text/event-stream'
    stream(:keep_open) do |out|
      DB.listen('tweets', loop: true) do |channel, event_id, payload|
        out << "data:#{payload}\n\n"
      end
    end
  end

  get '/tweets' do
    tweets = DB[:tweets].where('archived IS NULL')
    haml :tweets, locals: { tweets: tweets }, layout: false
  end

  post '/tweets' do
    id = DB[:tweets].insert(params[:tweet])
    DB.notify('tweets', payload: "/tweets")
    haml ''
  end

  get '/tweets/:id' do
    tweet = DB[:tweets][id: params[:id]]
    haml :tweet, locals: { tweet: tweet }, layout: false
  end

  patch '/tweets/:id' do
    tweet = DB[:tweets].where(id: params[:id]).update(params[:tweet])
    DB.notify('tweets', payload: "/tweets/#{params[:id]}")
    haml ''
  end

  get '/jquery.js' do
    vendor_javascript 'jquery.js'
  end

  get '/jquery-ujs.js' do
    vendor_javascript 'jquery-ujs.js'
  end

  get '/url_binding.js' do
    lib_javascript 'url_binding.js'
  end

  helpers do
    def jquery_rails_location
      Bundler.load.specs.find { |spec| spec.name == 'jquery-rails' }.full_gem_path
    end

    def javascript(file)
      content_type 'application/javascript'
      file.read
    end

    def vendor_javascript(name)
      path = File.join(jquery_rails_location, 'vendor', 'assets', 'javascripts', file_name)
      Pathname(path)
    end

    def lib_javascript(name)
      path = File.expand_path('../../lib/assets/javascripts/url_binding.js', __FILE__)
      javascript Pathname(path)
    end
  end
  
  DB = Sequel.connect('postgres://localhost/url_binding_test', max_connections: 10)  
  set :public_folder, File.dirname(__FILE__) + '/static'
end
