require 'sinatra/base'
require 'pry'
require 'json'
require 'sequel'
require 'pathname'
require 'forme'

class App < Sinatra::Base
  after do
    action_methods = [ 'POST', 'PATCH', 'DELETE' ]
    if action_methods.include?(request.request_method)
      p "#{request.request_method}: Notifying of #{request.path}"
      DB[:url_events].insert(url: request.path, sent_at: Time.new)
      DB.notify('client', payload: request.path)
    end
  end

  get '/' do
    last_event = DB[:url_events].order(Sequel.asc(:sent_at)).last
    haml :index, locals: { last_event: last_event }
  end

  get '/events' do
    last_event_sent_at = Time.at(params[:sent_at].to_i / 1000)
    content_type 'text/event-stream'
    stream(:keep_open) do |out|
      url_events = DB[:url_events].
        where('sent_at > ?', last_event_sent_at).
        map { |url_event| url_event[:url] }.
        uniq
      
      p "Catching a client up on #{url_events.join(', ')}"
      url_events.each do |url|
        out << "data:#{url}\n\n"
      end

      DB.listen('client', loop: true) do |channel, event_id, payload|
        out << "data:#{payload}\n\n"
      end
    end
  end

  delete '/stories/:id' do
    id = params[:id]
    DB[:stories].where(id: id).update(archived: true)
    head 200
  end

  patch '/stories' do
    story_ids = params[:stories].map { |story| story['id'] }
    pg_array = "{#{story_ids.join(',')}}"
    DB[:stories].where(id: story_ids).update("position = idx('#{pg_array}', id)")
    head 200
  end

  get '/stories' do
    stories = DB[:stories].where('archived IS NULL').order(Sequel.asc(:position))
    haml :stories, locals: { stories: stories }, layout: false
  end

  get '/stories/new' do
    haml :new_story, layout: false
  end

  post '/stories' do
    stories = DB[:stories].insert(params[:story])
    head 200
  end

  get '/stories/:id/edit' do
    story = DB[:stories][id: params[:id]]
    story_comments = DB[:story_comments].where('archived IS NULL').where(story_id: params[:id])
    haml :edit_story, locals: { story: story, story_comments: story_comments }, layout: false
  end

  get '/stories/:id' do
    story = DB[:stories][id: params[:id]]
    haml :story, locals: { story: story }, layout: false
  end

  patch '/stories/:id' do
    DB[:stories].where(id: params[:id]).update(params[:story])
    head 200
  end

  get '/stories/:story_id/comments' do
    story_comments = DB[:story_comments].where('archived IS NULL').where(story_id: params[:story_id])
    haml :story_comments, locals: { story_comments: story_comments }, layout: false
  end

  post '/stories/:story_id/comments' do
    comment = params[:story_comment]
    comment[:story_id] = params[:story_id]
    DB[:story_comments].insert(comment)
    head 200
  end

  patch '/comments/:id' do
    id = params[:id]
    story_comment = {
      content: params[:story_comment][:content],
      archived: params[:story_comment][:archived]
    }
    DB[:story_comments].where(id: id).update(story_comment)
    head 200
  end

  get '/comments/:id' do
    story_comment = DB[:story_comments][id: params[:id]]
    haml :story_comment, locals: { story_comment: story_comment }, layout: false
  end
  
  get '/comments/:id/edit' do
    story_comment = DB[:story_comments][id: params[:id]]
    haml :edit_story_comment, locals: { story_comment: story_comment }, layout: false
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
    include Forme

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

    def head(status_code)
      status(status_code)
      haml '', layout: false
    end
  end
  
  DB = Sequel.connect('postgres://localhost/url_binding_test', max_connections: 1000)  
  set :public_folder, File.dirname(__FILE__) + '/static'
end


  # get '/tweets' do
  #   tweets = DB[:tweets].where('archived IS NULL')
  #   haml :tweets, locals: { tweets: tweets }, layout: false
  # end

  # post '/tweets' do
  #   id = DB[:tweets].insert(params[:tweet])
  #   DB.notify('client', payload: "/tweets")
  #   haml ''
  # end

  # get '/tweets/:id' do
  #   tweet = DB[:tweets][id: params[:id]]
  #   haml :tweet, locals: { tweet: tweet }, layout: false
  # end

  # patch '/tweets/:id' do
  #   tweet = DB[:tweets].where(id: params[:id]).update(params[:tweet])
  #   DB.notify('client', payload: "/tweets/#{params[:id]}")
  #   haml ''
  # end
