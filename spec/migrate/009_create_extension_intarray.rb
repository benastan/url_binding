Sequel.migration do
  up do
    execute 'CREATE EXTENSION intarray'
  end

  down do
    execute 'DROP EXTENSION intarray'
  end
end
