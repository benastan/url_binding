Sequel.migration do
  up do
    add_column :stories, :archived, TrueClass
  end

  down do
    drop_column :stories, :archived
  end
end
