Sequel.migration do
  up do
    create_table :story_comments do
      primary_key :id
      Numeric :story_id
      String :content
      String :commentee
      DateTime :created_at
    end
  end

  down do
    drop_table :story_comments
  end
end
