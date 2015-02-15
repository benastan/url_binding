Sequel.migration do
  up do
    create_table :url_events do
      primary_key :id
      String :url
      DateTime :sent_at
    end
  end

  down do
    drop_table :url_events
  end
end
