require 'spec_helper'

describe UrlBinding do
  include Capybara::DSL

  specify do
    visit '/'
    fill_in 'Message', with: 'Hello, World'
    click_on 'Tweet'
    expect(page).to have_content 'Hello, World'
    visit '/'
    expect(page).to have_content 'Hello, World'
    fill_in 'Message', with: 'Foo Bar Rhubarb'
    click_on 'Tweet'
    expect(page).to have_content 'Foo Bar Rhubarb'
  end
end
