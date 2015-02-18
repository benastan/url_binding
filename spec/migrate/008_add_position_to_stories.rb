Sequel.migration do
  up do
    add_column :stories, :position, Numeric
  end

  down do
    drop_column :stories, :position
  end
end
