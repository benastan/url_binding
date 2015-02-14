Sequel.migration do
  up do
    create_table :tweets do
      primary_key :id
      String :message
    end
  end

  down do
    drop_table :tweets
  end
end
