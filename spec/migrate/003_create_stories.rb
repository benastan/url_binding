Sequel.migration do
  up do
    create_table :stories do
      primary_key :id
      String :title
      String :description
      TrueClass :epic
      String :owner
      String :assignee
    end
  end

  down do
    drop_table :stories
  end
end
