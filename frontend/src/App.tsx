import { useEffect, useState } from 'react';
import ButtonPanel from './components/ButtonPanel.tsx';
import MenuPanel from './components/MenuPanel.tsx';
import Table from './components/Table.tsx';
import { fetchDatabaseData, fetchTableNames, fetchTableDataByName } from './services/databaseService.ts';
import { DatabaseType, TableType } from './types/databaseTypes.ts';
import { queryBuilder } from './scripts/query/queryBuilder.ts';
import TalbeListSelect from './components/TableListSelect.tsx';
import { sendDeleteQuery, sendInsertQuery, sendSelectQuery, sendUpdateQuery } from './scripts/query/queryService.ts';

function App() {

  const [activeTable, setActiveTable] = useState<TableType | null>(null);

  const [tableValues, setTableValues] = useState<string[][]>([]);

  const [tableColumns, setTableColumns] = useState<string[]>([]);

  const [editValues, setEditValues] = useState<string[]>([]);

  const [tableNames, setTableNames] = useState([]);
  const [selectedTableName, setSelectedTableName] = useState("");

  const [activeColumns, setActiveColumns] = useState<number[]>([0]);

  const [primaryKeys, setPrimaryKeys] = useState<number[]>([]);

  const updateActiveColumns = (updater: (prev: number[]) => number[]) => {
    setActiveColumns(updater);
  };

  const clearActiveColumns = () => {
    setActiveColumns([0]);
  }

  // useEffect(() => {
  //   console.log('active columns', activeColumns);
  // }, activeColumns);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const fetchedTables = await fetchTableNames();
        if (fetchedTables) {
          setTableNames(fetchedTables);
        }
      } catch (e) {
        console.error("Error fetching table names:", e);
      }
    }
    fetchTables();
  }, [])

  useEffect(() => {
    if (tableNames.length > 0) {
      setSelectedTableName(tableNames[0]);
    }
  }, [tableNames]);

  useEffect(() => {
    const fetchTableData = async () => {
      try {
        const fetchedTableData = await fetchTableDataByName(selectedTableName);
        if (fetchedTableData) {
          console.log('fetched table data', fetchedTableData);

          clearActiveColumns();

          setActiveTable(fetchedTableData);
          setTableValues(fetchedTableData.values);
          setTableColumns(fetchedTableData.columns)
          setPrimaryKeys(fetchedTableData.primaryKeys);
        }
      } catch (e) {
        console.error("Error fetching table data:", e);
      }
    }

    if (selectedTableName) {

      fetchTableData();
    }
  }, [selectedTableName]);

  useEffect(() => {
    if (activeTable) {
      clearActiveColumns();

      console.log(activeTable);

      queryBuilder.setActiveTable(activeTable.tableName);
      queryBuilder.setSelectingColumns(activeTable.columns);
    }
  }, [activeTable]);

  const editValue = (editObject: string[]) => {
    setEditValues(editObject);
  }

  const clearEditValue = () => {
    setEditValues([]);
  }

  const executeDelete = async (id: number) => {
    const deleteQueryResult = await sendDeleteQuery(id);

    const lastQuery = queryBuilder.getLastSelectQuery();

    getSelectQueryResult(lastQuery);
  }

  const executeUpdate = async (inputValues: string[]) => {
    const updateQueryResult = await sendUpdateQuery(inputValues);

    const lastQuery = queryBuilder.getLastSelectQuery();

    getSelectQueryResult(lastQuery);
  }

  const executeInsert = async (inputValues: string[]) => {
    const insertQueryResult: any = await sendInsertQuery(inputValues);

    const lastQuery = queryBuilder.getLastSelectQuery();

    getSelectQueryResult(lastQuery);
  }

  const getSelectQueryResult = async (query: string) => {
    const fetchedQueryResult: any = await sendSelectQuery(query);
    setTableColumns(fetchedQueryResult.columns);
    setTableValues(fetchedQueryResult.values);

    console.log('fetched query result', fetchedQueryResult);
  }

  const executeSelect = async () => {
    const selectQuery = queryBuilder.executeSelect();

    getSelectQueryResult(selectQuery);
  }

  return (
    <>
      <div className='main-container'>
        <div className='content d-grid'>
          <div className='button-panel-wrapper'>
            {activeTable && <ButtonPanel
              tableColumnItems={activeTable.columns}
              tableName={activeTable?.tableName}
              editValues={editValues}
              clearEditValue={clearEditValue}
              activeColumns={activeColumns}
              updateActiveColumns={updateActiveColumns}
              clearActiveColumns={clearActiveColumns}
              primaryKeys={primaryKeys}
              executeUpdate={executeUpdate}
              executeInsert={executeInsert}
              executeSelect={executeSelect}
            />}
          </div>
          <div className='table-list-wrapper'>
            <TalbeListSelect
              tableNames={tableNames}
              setSelectedTableName={setSelectedTableName}
            />
          </div>
          <div className='table-wrapper'>
            {activeTable && <Table
              tableColumns={tableColumns}
              tableValues={tableValues}
              editValue={editValue}
              executeDelete={executeDelete}
            />}
          </div>
        </div>
      </div>

      <MenuPanel />
    </>
  )
}

export default App
