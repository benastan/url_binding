Sequel.migration do
  up do
    add_column :story_comments, :archived, TrueClass
  end

  down do
    drop_column :story_comments, :archived
  end
end
