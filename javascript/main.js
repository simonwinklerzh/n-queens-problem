/* ==========================================================================
   Queens Problem - Backtracking algorithm
   https://www.globalsoftwaresupport.com/backtracking-algorithms-explained/
   ========================================================================== */

(function () {

  /* ==========================================================================
     Program
     ========================================================================== */

  /**
   * Shows whether or not a queen is present and if a
   * cell is already attacked by a queen on another cell.
   *
   * @typedef {Object} Queens_cell
   * @property {(0|1)} value
   * @property {string[]} attackers - xy coordinates
   */

  /**
   * @typedef {Queens_value[]} Queens_row
   */

  /**
   * @typedef {Queens_row[]} Queens_board
   */

  /**
   * Meta information
   * @typedef {Object} Queens_info
   * @property {Number} step_count - Shows how many times a queen has been set on the board
   * @property {Number} time - measure the duration
   */

  /**
   * Queens board with meta information
   * @typedef {Object} Queens_board_with_meta
   * @property {Queens_info} meta_info
   * @property {Queens_board} board
   */

  /**
   * Report
   * @typedef {Object} Queens_report
   * @property {Number} average_time
   * @property {Number} average_steps
   * @property {Number} median_steps
   * @property {Number} number_of_boards
   * @property {Number} board_size
   * @property {String} description
   */

  /**
   * List of reports
   * @typedef {Queens_report[]} Queens_reports
   */

  const queens_reports_storage_key = 'Queens_reports';

  /**
   * @param {Number}
   * @returns {Queens_board}
   */
  function create_initial_board(number_of_queens) {
    const board = [];

    for (let i = 0; i < number_of_queens; i += 1) {
      const row = [];
      for (let i_2 = 0; i_2 < number_of_queens; i_2 += 1) {
        row.push({ value: 0, attackers: [] });
      }
      board.push(row);
    }

    return board;
  }

  /**
   * @param {Number} col_index
   * @param {Queens_board} board
   * @returns {(Queens_board|false)}
   */
  function set_queens(board, row_index) {
    // All queens have been placed
    if (row_index === board.length) {
      return true;
    }

    for (let col_index = 0; col_index < board.length; ++col_index) {
      if (place_is_valid(board, row_index, col_index)) {
        board[row_index][col_index].value = 1;
        if (set_queens(board, row_index + 1)) {
          return board;
        }
        // Backtracking
        board[row_index][col_index].value = 0;
      }
    }

    return false;
  }

  /**
   * @param {Queens_board} board
   * @param {Number} row_index
   * @param {Number} col_index
   * @returns {Boolean}
   */
  function place_is_valid(board, row_index, col_index) {

    // Check if there is already a queen in the same column
    for (let i = 0; i < board.length; i += 1) {
      if (board[i][col_index].value === 1) {
        return false;
      }
    }

    // Check the top left - bottom right diagonal
    for (let i = row_index, j = col_index; i >= 0 && j >= 0; i -= 1, j -= 1) {
      if (board[i][j].value === 1) {
        return false;
      }
    }

    // Check the top right - bottom left diagonal
    for (let i = row_index, j = col_index; i >= 0 && j < board.length; i -= 1, j +=1) {
      if (board[i][j].value === 1) {
        return false;
      }
    }

    return true;
  }

  /**
   * @param {Queens_board} board
   * @returns {number}
   */
  function get_queens_count(board) {
    return board
      .flat()
      .reduce(function (accumulator, current) {
        return accumulator + current.value;
      }, 0);
  }

  /**
   * @param {Queens_board} board
   * @returns {Queens_board} - a subset of the board, with only free cells
   */
  function get_free_cells(board) {
    return board
      .flat()
      .filter(function (current) {
        if (current.attackers.length === 0) {
          return true;
        }
        return false;
      });
  }

  /**
   * @param {Queens_board}
   * @param {Number} y
   * @returns {Queens_cell[]}
   */
  function get_row(board, y) {
    return board[y];
  }

  /**
   * @param {Queens_board}
   * @param {Number} x
   * @returns {Queens_cell[]}
   */
  function get_col(board, x) {
    return board.map(function (row) {
      return row[x];
    });
  }

  /**
   * @param {Queens_board}
   * @param {Number} x
   * @param {Number} y
   * @returns {Queens_cell[]}
   */
  function get_diagonals(board, x, y) {
    const result = [];

    // To the top left
    for (
      let col_index = x,
      row_index = y;

      col_index >= 0 && row_index >= 0;

      col_index -= 1,
      row_index -= 1
    ) {
      result.push(board[row_index][col_index]);
    }

    // To the bottom right
    for (
      let col_index = x,
      row_index = y;

      col_index < board.length && row_index < board.length;

      col_index += 1,
      row_index += 1
    ) {
      result.push(board[row_index][col_index]);
    }

    // To the top right
    for (
      let col_index = x,
      row_index = y;

      col_index < board.length && row_index >= 0;

      col_index += 1,
      row_index -= 1
    ) {
      result.push(board[row_index][col_index]);
    }

    // To the bottom left
    for (
      let col_index = x,
      row_index = y;

      col_index >= 0 && row_index < board.length;

      col_index -= 1,
      row_index += 1
    ) {
      result.push(board[row_index][col_index]);
    }

    return result;
  }

  /**
   * @param {Queens_board} board
   * @param {Queens_cell} cell
   * @returns {Queens_cell[]}
   */
  function get_neighbours(board, cell) {
    const [x, y] = get_x_y_coordinates(board, cell);
    return [
      ...get_row(board, y),
      ...get_col(board, x),
      ...get_diagonals(board, x, y)
    ];
  }

  /**
   * Mark all fields that are attacked by queen at `x` `y`
   *
   * @param {Queens_board} board
   * @param {Queens_cell} cell
   */
  function mark_attacked_fields(board, cell) {
    cell.value = 1;
    const neighbours = get_neighbours(board, cell);
    const [x, y] = get_x_y_coordinates(board, cell);
    neighbours.forEach(function mark(current) {
      current.attackers.push(`${x}|${y}`);
    });
  }

  /**
   * Unmark all fields that are attacked by queen at `x` `y`
   *
   * @param {Queens_board} board
   * @param {Queens_cell} cell
   */
  function unmark_attacked_fields(board, cell) {
    cell.value = 0;
    const neighbours = get_neighbours(board, cell);
    const [x, y] = get_x_y_coordinates(board, cell);
    neighbours.forEach(function mark(current) {
      current.attackers = current.attackers.filter(function unmark(attacker) {
        return attacker !== `${x}|${y}`;
      });
    });
  }

  /**
   * @param {Queens_board} board
   * @param {Queens_cell} cell
   * @returns {(Number[]|Boolean)}
   */
  function get_x_y_coordinates(board, cell) {
    for (let row_index = 0; row_index < board.length; row_index += 1) {
      if (board[row_index].includes(cell)) {
        return [
          // x
          board[row_index].indexOf(cell),
          // y
          row_index
        ];
      }
    }
    return false;
  }

  const wait = ms => new Promise((resolve) => setTimeout(resolve, ms));


  /**
   * This is another implementation of the algorithm which sets the
   * queens at a random position. It marks every field that is already
   * attacked by a previously set queen and excludes it from the
   * random cells available to choose from.
   *
   * @param {Queens_board} board
   * @param {Function} step
   * @returns {(Queens_board|false)}
   */
  async function set_queens_random(board, step = null) {
    const queens_count = get_queens_count(board);

    // All queens have been placed
    if (queens_count === board.length) {
      return true;
    }

    const cells = shuffle(get_free_cells(board));

    // Not all queens have been placed, but there are no free cells left
    if (cells.length === 0) {
      return false;
    }

    // There are less remaining free cells than queens to place on the board
    if (cells.length < board.length - queens_count) {
      return false;
    }

    for (let i = 0; i < cells.length; i += 1) {
      const random_cell = cells[i];
      mark_attacked_fields(board, random_cell);

      if (step) {
        await step(board, {
          step_type: 'forward'
        });
      }

      if (await set_queens_random(board, step)) {
        return board;
      }

      // Backtracking
      unmark_attacked_fields(board, random_cell);


      if (step) {
        await step(board, {
          step_type: 'backward'
        });
      }
    }

    return false;
  }

  /**
   * @returns {Queens_reports}
   */
  function get_reports_from_storage() {
    const reports_raw = window.localStorage.getItem(queens_reports_storage_key);
    const reports_parsed = JSON.parse(reports_raw);
    if (reports_parsed === null) {
      return [];
    }
    return reports_parsed;
  }

  /**
   * @param {Queens_reports} reports
   */
  function set_reports_in_storage(reports) {
    window.localStorage.setItem(queens_reports_storage_key, JSON.stringify(reports));
  }

  /**
   * @param {Number} id - index of the entry to delete
   * @returns {Queens_report}
   */
  function remove_report_from_storage(id) {
    const reports = get_reports_from_storage();
    const report_to_delete = reports.splice(id, 1);
    set_reports_in_storage(reports);
    console.log(report_to_delete);
    return report_to_delete;
  }

  /**
   * @param {Number} id - index of the entry to update
   * @param {Queens_report} update_values - values to merge
   * @returns {Queens_report}
   */
  function update_report_in_storage(id, update_values) {
    const reports = get_reports_from_storage();
    const updated_report = {
      ...reports[id],
      ...update_values
    };
    reports[id] = updated_report;
    set_reports_in_storage(reports);
    return updated_report;
  }

  /**
   * Group reports by board count, get average values by board count
   * @param {Queens_reports}
   * @returns {Grouped_reports}
   */
  function group_reports(reports) {
    return reports.reduce(function grouped_reports(
      accumulator,
      current
    ) {
      if (!accumulator[current.board_size]) {
        accumulator[current.board_size] = [];
      }
      accumulator[current.board_size].push(current);
      return accumulator;
    }, {});
  }


  /* ==========================================================================
     Input
     ========================================================================== */

    /**
     * @param {Queens_report} report
     * @param {Event} e
     */
    function handle_save_button_click(report, e) {
      const reports = get_reports_from_storage();
      reports.push(report);
      set_reports_in_storage(reports);
    }


  /* ==========================================================================
     View
     ========================================================================== */

  /**
   * Create a HTML string representing the Sudoku board
   *
   * @param {Queens_board|false} board
   * @param {Queens_info} [meta_info]
   * @returns {string}
   */
  function create_queens_view(board, meta_info = false) {
    if (!board) {
      return `<div class="queens"><p>Keine Lösung gefunden</p></div>`;
    }

    const empty_board = get_queens_count(board) === 0;

    return `
    <div class="queens ${empty_board ? 'queens--loading' : ''}" style="grid-template-columns: repeat(${board.length}, 1fr);">
      ${board.map(function create_row_view(row, row_index) {
        return row.map(function create_cell_view(cell, cell_index) {
          return `<div
            data-index_x="${cell_index}"
            data-index_y="${row_index}"
            data-index="${`${row_index}${cell_index}`}"
            data-value="${cell.value}"
            data-attackers_count="${
              cell.attackers.reduce(function accumulate_attackers (sum) {
                return sum + 1;
              }, 0)
            }"
            class="queens__cell"></div>`;
        }).join('');
      }).join('')}
    </div>
    ${
      meta_info
        ? `<div class="queens-meta">
            ${ 'step_count' in meta_info
              ? `<p class="queens-meta__step-count">
                  <b class="queens-meta__step-count-label">Steps:</b>
                  ${meta_info.step_count}
                </p>`
              : ''
            }
            ${ 'time' in meta_info
              ? `<p class="queens-meta__time">
                  <b class="queens-meta__time-label">Time:</b>
                  ${meta_info.time} ms
                </p>`
              : ''
            }
          </div>`
        : ''
    }
    `;
  }

  /**
   * @param {Queens_report[]} reports
   * @param {Queens_report} report
   * @param {Number} [edit_id]
   * @returns {String}
   */
  function create_queens_reports_list_entry(edit_id = null, reports, report) {
    const id = reports.indexOf(report);
    return `
      <li class="queens-reports__entry" data-id="${id}">
        <p class="queens-reports__entry-data">
          <span class="queens-reports__entry-data-value">${id}</span>
        </p>
        <p class="queens-reports__entry-data">
          <span class="queens-reports__entry-data-value">${round_to_two_decimals(report.average_time)}</span>
        </p>
        <p class="queens-reports__entry-data">
          <span class="queens-reports__entry-data-value">${report.average_steps}</span>
        </p>
        <p class="queens-reports__entry-data">
          <span class="queens-reports__entry-data-value">${report.median_steps}</span>
        </p>
        <p class="queens-reports__entry-data">
          <span class="queens-reports__entry-data-value">${report.number_of_boards}</span>
        </p>
        <p class="queens-reports__entry-data">
          <span class="queens-reports__entry-data-value">${report.board_size}</span>
        </p>
        <p class="queens-reports__entry-data">
          ${
            id === edit_id
              ? `<input
                  class="queens-reports__entry-description-input"
                  type="text"
                  value="${report.description ? report.description : ''}">`
              : `<span
                  class="queens-reports__entry-data-value">
                    ${report.description ? report.description : ' - '}
                </span>`
          }
        </p>
        <p class="queens-reports__entry-data">
          ${
            id === edit_id
              ? `<button
                  class="queens-reports__entry-save">✓</button>`
              : `<button
                  class="queens-reports__entry-edit">✎</button>
                <button
                  class="queens-reports__entry-delete">✗</button>`
          }
        </p>
      </li>
    `;
  }

  /**
   * Create queens reports view
   * @param {Queens_reports} reports
   * @param {Number} [edit_id]
   * @returns {String}
   */
  function create_queens_reports_view_grouped(reports, edit_id) {
    const grouped_reports = group_reports(reports);
    if (!reports || reports.length === 0) {
      return `
        <div class="queens-reports">
          <h2 class="queens-reports__title">Reports</h2>
          <p class="queens-reports__empty">No reports yet</p>
        </div>
      `;
    }
    return `
      <div class="queens-reports">
        <h2 class="queens-reports__title">Reports</h2>
        <ul class="queens-reports__list">
          ${Object
            .keys(grouped_reports)
            .map(function create_grouped_view(key, index) {
              return `
              <li class="queens-reports__entry-group-title"><b>Board size: ${key}</b></li>
              <li class="queens-reports__entry queens-reports__entry--head">
                <p class="queens-reports__entry-data">
                  <span class="queens-reports__entry-data-label">ID:</span>
                </p>
                <p class="queens-reports__entry-data">
                  <span class="queens-reports__entry-data-label">Avg. time:</span>
                </p>
                <p class="queens-reports__entry-data">
                  <span class="queens-reports__entry-data-label">Avg. steps:</span>
                </p>
                <p class="queens-reports__entry-data">
                  <span class="queens-reports__entry-data-label">Median steps:</span>
                </p>
                <p class="queens-reports__entry-data">
                  <span class="queens-reports__entry-data-label">Boards:</span>
                </p>
                <p class="queens-reports__entry-data">
                  <span class="queens-reports__entry-data-label">Size:</span>
                </p>
                <p class="queens-reports__entry-data">
                  <span class="queens-reports__entry-data-label">Desc.:</span>
                </p>
                <p class="queens-reports__entry-data">
                  <span class="queens-reports__entry-data-label">Edit:</span>
                </p>
              </li>
              ${
                grouped_reports[key].map(
                  create_queens_reports_list_entry.bind(null, edit_id, reports)
                ).join('')
              }
              <li class="queens-reports__entry queens-reports__entry--footer">
                <p class="queens-reports__entry-data">
                  <span class="queens-reports__entry-data-label">Total average:</span>
                </p>
                <p class="queens-reports__entry-data">
                  <span class="queens-reports__entry-data-label">
                    ${
                      round_to_two_decimals(
                        get_average_number(
                          grouped_reports[key]
                            .map(get_prop.bind(null, 'average_time'))
                        )
                      )
                    }
                  </span>
                </p>
                <p class="queens-reports__entry-data">
                  <span class="queens-reports__entry-data-label">
                    ${
                      round_to_two_decimals(
                        get_average_number(
                          grouped_reports[key]
                            .map(get_prop.bind(null, 'average_steps'))
                        )
                      )
                    }
                  </span>
                </p>
                <p class="queens-reports__entry-data">
                  <span class="queens-reports__entry-data-label">
                    ${
                      get_median_number(
                        grouped_reports[key]
                          .map(get_prop.bind(null, 'median_steps'))
                      )
                    }
                  </span>
                </p>
                <p class="queens-reports__entry-data">
                  <span class="queens-reports__entry-data-label">
                    ${
                      grouped_reports[key]
                        .map(get_prop.bind(null, 'number_of_boards'))
                        .reduce((a, b) => a + b)
                    }
                  </span>
                </p>
                <p class="queens-reports__entry-data">
                  <span class="queens-reports__entry-data-label"></span>
                </p>
                <p class="queens-reports__entry-data">
                  <span class="queens-reports__entry-data-label"></span>
                </p>
                <p class="queens-reports__entry-data">
                  <span class="queens-reports__entry-data-label"></span>
                </p>
              </li>`
            }).join('')}
        </ul>
        <button class="queens-reports__refresh-button">Refresh</button>
      </div>
    `;
  }

  /**
   * Create queens reports view
   * @param {Queens_reports} reports
   * @returns {String}
   */
  function create_queens_reports_view(reports) {
    return `
      <div class="queens-reports">
        <ul class="queens-reports__list">
          ${reports.map(create_queens_reports_list_entry).join('')}
        </ul>
        <button class="queens-reports__refresh-button">Refresh</button>
      </div>
    `;
  }

  /**
   * @param {String} target
   * @param {Queens_reports} reports
   * @param {Number} [edit_id]
   * @returns {Queens_reports}
   */
  function render_queens_reports_view(target, reports, edit_id = null) {
    const target_node = document.getElementById(target);
    // Render view in DOM
    target_node.innerHTML = create_queens_reports_view_grouped(reports, edit_id);
    // Append event listeners
    equip_queens_reports_view(target);
    return reports;
  }

  /**
   * @param {String} id - HTML id
   */
  const equip_queens_reports_view = once(function(target) {
    const target_node = document.getElementById(target);
    target_node
      .addEventListener('click', function(e) {
        // Entry delete button
        if (e.target.matches('.queens-reports__entry-delete')) {
          const parent = e.target.closest('.queens-reports__entry');
          const id = parseInt(parent.getAttribute('data-id'), 10);
          remove_report_from_storage(id);
          render_queens_reports_view(target, get_reports_from_storage());
        }
        // Entry edit button
        else if (e.target.matches('.queens-reports__entry-edit')) {
          const parent = e.target.closest('.queens-reports__entry');
          const id = parseInt(parent.getAttribute('data-id'), 10);
          render_queens_reports_view(target, get_reports_from_storage(), parseInt(id, 10));
        }
        // Entry save button
        else if (e.target.matches('.queens-reports__entry-save')) {
          const parent = e.target.closest('.queens-reports__entry');
          const id = parseInt(parent.getAttribute('data-id'), 10);
          const description = parent
            .querySelector('.queens-reports__entry-description-input')
            .value;
          update_report_in_storage(id, { description });
          render_queens_reports_view(target, get_reports_from_storage());
        }
        // Refresh button
        else if (e.target.matches('.queens-reports__refresh-button')) {
          render_queens_reports_view(target, get_reports_from_storage());
        }
        else {
          return;
        }
      });
  });

  /**
   * @param {Queens_board} board
   * @param {String} target - HTML ID
   * @param {Queens_info} [meta_info]
   * @returns {Queens_board}
   */
  function render_demo_queens_problem(target, board, meta_info) {
    document.getElementById(target).innerHTML = create_queens_view(board, meta_info);
    return board;
  }

  /**
   * @async
   * @param {String} target - HTML ID
   * @param {Queens_board} board
   * @returns {Queens_info}
   */
  async function render_and_display_metrics(target, board) {
    let step_count = 0;
    let start_time = window.performance.now();
    render_demo_queens_problem(target, board);
    await wait(0);
    const solved_board = await set_queens_random(
      board,
      async function (board, step_info) {
        await wait(0);
        // Count how many times a queen has been set on the board
        if (step_info && step_info.step_type && step_info.step_type === 'forward') {
          step_count += 1;
        }
      }
    );
    let end_time = window.performance.now();
    let time = end_time - start_time;
    render_demo_queens_problem(target, solved_board, { step_count, time });
    return {
      step_count,
      time
    }
  }


  /**
   * @async
   * @param {String} target - HTML ID
   * @param {Queens_board} board
   * @param {Number} [step_pause] - in miliseconds
   */
  async function render_demo_queens_problem_with_steps(target, board, step_pause = 10) {
    let step_count = 0;
    render_demo_queens_problem(target, board);
    const solved_board = await set_queens_random(
      board,
      async function (board, step_info) {
        // Count how many times a queen has been set on the board
        if (step_info && step_info.step_type && step_info.step_type === 'forward') {
          step_count += 1;
        }
        await wait(step_pause);
        render_demo_queens_problem(target, board, { step_count });
      }
    );
    render_demo_queens_problem(target, solved_board, { step_count });
  }


  /**
   * @async
   * @param {String} target - HTML ID
   * @param {Number} board_size
   * @param {Number} [number_of_boards]
   * @param {Function} [save_button_handler]
   * @returns {Queens_report}
   */
  async function render_and_display_average_metrics(
    target,
    board_size,
    number_of_boards = 10,
    save_button_handler = null
  ) {
    const execution_times = [];
    const execution_steps = [];
    const target_node = document.getElementById(target);

    const queens_report = {
      average_time: 0,
      average_steps: 0,
      median_steps: 0,
      number_of_boards: 0,
      board_size
    };

    target_node.classList.add('queens-info');

    // Create new HTML Elements
    const average_time_node = document.createElement('div');
    average_time_node.classList.add('queens-info__time');
    const average_step_node = document.createElement('div');
    average_step_node.classList.add('queens-info__steps');
    const median_step_node = document.createElement('div');
    median_step_node.classList.add('queens-info__median');
    const board_count_node = document.createElement('div');
    board_count_node.classList.add('queens-info__board-count');
    const save_button = document.createElement('button');
    save_button.classList.add('queens-info__save-button');
    const boards_container = document.createElement('div');
    boards_container.classList.add('queens-info__boards-container');

    // Insert elements into the DOM
    target_node.appendChild(average_time_node);
    target_node.appendChild(average_step_node);
    target_node.appendChild(median_step_node);
    target_node.appendChild(board_count_node);
    target_node.appendChild(save_button);
    target_node.appendChild(boards_container);

    // Default text
    average_time_node.innerHTML = `<b>Average time (ms):</b>`;
    average_step_node.innerHTML = `<b>Average steps:</b>`;
    median_step_node.innerHTML = `<b>Median steps:</b>`;
    board_count_node.innerHTML = `<b>Board count:</b>`;

    // Hide the save button if no handler function is provided,
    // otherwise add the event handler
    if (!save_button_handler) {
      save_button.setAttribute('style', 'display: none;');
    } else {
      save_button.innerHTML = `Save report`;
      save_button.onclick = save_button_handler.bind(null, queens_report);
    }

    // Get solutions, render board, get and display metrics
    for (i = 0; i < number_of_boards; i += 1) {
      const container_id = `queens-info-${Date.now()}`;
      const container_node = document.createElement('div');
      const board = create_initial_board(board_size);
      container_node.setAttribute('id', container_id);
      container_node.classList.add('queens-info__board');
      boards_container.prepend(container_node);

      const meta_info = await render_and_display_metrics(container_id, board);
      execution_times.push(meta_info.time);
      execution_steps.push(meta_info.step_count);

      queens_report.average_time = get_average_number(execution_times);
      queens_report.average_steps = Math.round(get_average_number(execution_steps));
      queens_report.median_steps = Math.round(get_median_number(execution_steps));
      queens_report.number_of_boards += 1;

      average_time_node.innerHTML =
        `<b>Average time (ms):</b> ${
          queens_report.average_time
        }`;
      average_step_node.innerHTML =
        `<b>Average steps:</b> ${
          queens_report.average_steps
        }`;
      median_step_node.innerHTML =
        `<b>Median steps:</b> ${
          queens_report.median_steps
        }`;
      board_count_node.innerHTML =
        `<b>Board count: ${
          queens_report.number_of_boards
        }</b>`;
    }
  }

  /**
   * @async
   */
  async function render_tests() {
    // Render reports
    render_queens_reports_view(
      'queens-target-3',
      get_reports_from_storage()
    );
    // Render visualised algorithm
    await render_demo_queens_problem_with_steps('queens-target-1', create_initial_board(9), 0);
    // Render solution without visualisation of the process
    // await render_and_display_metrics('queens-target-2', create_initial_board(6));
    // Generate a report
    // render_and_display_average_metrics(
    //   'queens-target-4',
    //   9,
    //   1000,
    //   handle_save_button_click
    // );
  }

  render_tests();

  /**
   * @param {Queens_board}
   */
  function print_queens_to_console(board) {
    console.table(board.map(row => row.map(cell => cell.value)));
  }

  /**
   * Log board to console
   * @param {Queens_board} board
   */
  function log_board(board) {
    console.log(board);
  }

}())
