require 'spec_helper'

describe UrlBinding do
  include Capybara::DSL

  DB = App::DB

  specify do
    visit '/'
  
    expect(page).to have_content 'New Story'
    
    DB[:stories].insert(title: 'Magically appearing story')
    DB.notify(:client, payload: '/stories')

    expect(page).to have_content('Magically appearing story')

    click_on 'New Story'
    fill_in 'Title', with: 'Hello, World'
    fill_in 'Description', with: 'This is my first story'
    click_on 'Create Story'
    expect(page).to have_content('Hello, World')

    within find('.story', text: 'Hello, World') do
      click_on 'Edit Story'
    end

    within find('.edit-story') do
      fill_in 'Title', with: 'Get shit done'
      fill_in 'Owner', with: 'Ben'
      click_on 'Update Story'
    end

    expect(page).to have_content 'Get shit done'
    visit current_path
    expect(page).to have_content 'Get shit done'

    within find('.story', text: 'Get shit done') do
      click_on 'Delete Story'
    end
    
    expect(page).to_not have_content 'Get shit done'
    visit current_path
    expect(page).to_not have_content 'Get shit done'

    within find('.story', text: 'Magically appearing story') do
      click_on 'Edit Story'
    end

    fill_in 'Your Name', with: 'Ben'
    fill_in 'Content', with: 'This is a great story!'

    story_id = DB[:stories].where('archived IS NULL').first[:id]
    DB[:story_comments].insert(
      story_id: story_id,
      commentee: 'Duder McDuderstein',
      content: 'The dude abides!'
    )
    DB.notify('client', payload: "/stories/#{story_id}/comments")

    expect(page).to have_content 'Duder McDuderstein'
    expect(page).to have_content 'The dude abides!'

    click_on 'Comment'

    expect(page).to have_content 'This is a great story!'
  end
end
