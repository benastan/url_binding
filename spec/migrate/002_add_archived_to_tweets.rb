Sequel.migration do
  up do
    add_column :tweets, :archived, TrueClass
  end

  down do
    drop_column :tweets, :archived
  end
end
