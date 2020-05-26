/* ==========================================================================
   Queens Problem - Backtracking algorithm
   ========================================================================== */

(function () {

  /* ==========================================================================
     Helper Functions
     ========================================================================== */

  /**
   * Shuffles array in place.
   * @param {Array} a items An array containing the items.
   */
  function shuffle(a) {
      var j, x, i;
      for (i = a.length - 1; i > 0; i--) {
          j = Math.floor(Math.random() * (i + 1));
          x = a[i];
          a[i] = a[j];
          a[j] = x;
      }
      return a;
  }

  /**
   * Returns a promise that resolves in `ms` milliseconds
   */
  const wait = ms => new Promise((resolve) => setTimeout(resolve, ms));

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
   * @property {Boolean} [is_last_added_cell] - used to display an animation
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
   * @property {Number} [time] - measure the duration
   * @property {Boolean} [should_animate_queens] - for a little CSS animation
   * @property {Boolean} [solved] - a solution has been found
   */

  /**
   * Queens board with meta information
   * @typedef {Object} Queens_board_with_meta
   * @property {Queens_info} meta_info
   * @property {Queens_board} board
   */

  /**
   * @typedef {Function} Solver
   * @async
   * @param {Queens_board} board
   * @param {Function} [step]
   * @param {...*}
   * @returns {(Queens_board|false)}
   */


  const minimum_time_for_showing_queens_animation = 300;

  /**
   * UI state
   */
  const state = (function () {
    let listeners = {};
    let internal_state = {
      board_size: 8,
      aborting: false,
      running_algorithm: null,
      step_timeout_duration: 0
    };
    return {
      /**
       * @property {String} property_name
       * @property {Function} fn
       */
      on_change(property_name, fn) {
        if (!(property_name in listeners)) {
          listeners[property_name] = [];
        }
        listeners[property_name].push(fn);
      },
      /**
       * @property {String} property_name
       * @property {*} value
       */
      update(property_name, value) {
        const update_info = {
          old_value: internal_state[property_name],
          new_value: value
        };
        internal_state = { ...internal_state, [property_name]: value };
        if (listeners[property_name]) {
          listeners[property_name].forEach(listener => listener(update_info));
        }
      },
      /**
       * @propert {String} property_name
       */
      get(property_name) {
        return internal_state[property_name];
      }
    }
  }());

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
   * @type {Solver}
   *
   * This is an implementation of a backtracking algorithm for solving
   * the queens problem.
   * It returns the first solution it finds by searching from the top
   * left to the bottom right.
   *
   * It works as follows:
   *
   * 1. It iterates through each row from top to bottom.
   *
   * 2. For each column in a row, it places a queen and checks
   * if the queen is being attacked by any of the previously set queens.
   *
   * 3. If this is the case, backtracking applies.
   *
   * 4. If the algorithm reaches the last row and is able to place
   * a queen at a valid position, a solution is found.
   */
  async function solver_set_queens(board, step = null, row_index = 0) {
    // All queens have been placed
    if (row_index === board.length) {
      return true;
    }

    for (let col_index = 0; col_index < board.length; ++col_index) {
      if (place_is_valid(board, row_index, col_index)) {
        board[row_index][col_index].value = 1;

        if (step) {
          const keep_running = await step(board, {
            step_type: 'forward'
          }, board[row_index][col_index]);
          if (keep_running === false) {
            return false;
          }
        }

        if (await solver_set_queens(board, step, row_index + 1)) {
          return board;
        }

        // Backtracking
        board[row_index][col_index].value = 0;

        if (step) {
          const keep_running = await step(board, {
            step_type: 'backward'
          }, board[row_index][col_index]);
          if (keep_running === false) {
            return false;
          }
        }
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
   * This function gives us the top left sub-square of a queens board.
   * It will include the middle-column and middle row, if the side
   * length of the square happens to be an uneven number.
   *
   * -----------------
   * | x | x |   |   |
   * -----------------
   * | x | x |   |   |
   * -----------------
   * |   |   |   |   |
   * -----------------
   * |   |   |   |   |
   * -----------------
   *
   * @param {Queens_board} board
   * @returns {Queens_board} - the top left sub-square of a board
   */
  function get_sub_suqare(board) {
    const middle_of_board = Math.ceil(board.length / 2);
    return board
      .flat()
      .filter(function (current, index) {
        const x_index = index % board.length + 1;
        const y_index = Math.ceil((index + 1) / board.length);
        if (x_index <= middle_of_board && y_index <= middle_of_board) {
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
   * Mark all fields that are attacked by queen at `x` `y`.
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

  /**
   * @param {Number} cell_index
   * @param {Number} row_index
   * @param {Queens_board} board
   * @returns {('bright'|'dark')}
   */
  function get_cell_color(cell_index, row_index, board) {
    const linear_index = cell_index + row_index * board.length;
    if (board.length % 2 !== 0) {
      return linear_index % 2 === 0
        ? 'bright'
        : 'dark';
    }
    return row_index % 2 !== 0
      ? linear_index % 2 === 0
        ? 'dark'
        : 'bright'
      : linear_index % 2 === 0
        ? 'bright'
        : 'dark';
  }

  /**
   * @type {Solver}
   *
   * This is another implementation of the algorithm which sets the
   * queens at a random position. It marks every field that is already
   * attacked by a previously set queen and excludes it from the
   * random cells available to choose from.
   */
  async function solver_set_queens_random(board, step = null) {
    const queens_count = get_queens_count(board);

    // All queens have been placed
    if (queens_count === board.length) {
      return true;
    }

    const remaining_cells = shuffle(get_free_cells(board));

    // Not all queens have been placed, but there are no free cells left
    if (remaining_cells.length === 0) {
      return false;
    }

    // There are less remaining free cells than queens to place on the board
    if (remaining_cells.length < board.length - queens_count) {
      return false;
    }

    for (let i = 0; i < remaining_cells.length; i += 1) {
      const random_cell = remaining_cells[i];
      mark_attacked_fields(board, random_cell);

      if (step) {
        const keep_running = await step(board, {
          step_type: 'forward'
        }, random_cell);
        if (keep_running === false) {
          return false;
        }
      }

      if (await solver_set_queens_random(board, step)) {
        return board;
      }

      // Backtracking
      unmark_attacked_fields(board, random_cell);

      if (step) {
        const keep_running = await step(board, {
          step_type: 'backward'
        }, random_cell);
        if (keep_running === false) {
          return false;
        }
      }
    }

    return false;
  }

  /**
   * @type {Solver}
   *
   * WIP
   *
   * This is an effort to improve 'solver_set_queens_random'.
   * On the first level of the recursive function, the algorithm
   * chooses a random field from only the top left sub-square of
   * the chess board.
   *
   * The idea is, that if there is no solution at all for one top
   * level field (selected in the first iteration), other invalid
   * paths that can be created by rotating / reflecting the board
   * are excluded automatically.
   *
   * I dont currently know how much sense this makes and how effective it is.
   *
   */
  async function solver_set_queens_random_2(
    board,
    step = null,
    first_run = true
  ) {
    const queens_count = get_queens_count(board);

    // All queens have been placed
    if (queens_count === board.length) {
      return true;
    }

    const remaining_cells = get_free_cells(board);

    // Not all queens have been placed, but there are no free cells left
    if (remaining_cells.length === 0) {
      return false;
    }

    // There are less remaining free cells than queens to place on the board
    if (remaining_cells.length < board.length - queens_count) {
      return false;
    }

    const cells_to_check = first_run
      ? shuffle(get_sub_suqare(board))
      : remaining_cells;

    for (let i = 0; i < cells_to_check.length; i += 1) {
      const random_cell = cells_to_check[i];
      mark_attacked_fields(board, random_cell);

      if (step) {
        const keep_running = await step(board, {
          step_type: 'forward'
        }, random_cell);
        if (keep_running === false) {
          return false;
        }
      }

      if (await solver_set_queens_random_2(board, step, false)) {
        return board;
      }

      // Backtracking
      unmark_attacked_fields(board, random_cell);

      if (step) {
        const keep_running = await step(board, {
          step_type: 'backward'
        }, random_cell);
        if (keep_running === false) {
          return false;
        }
      }
    }

    return false;
  }

  /* ==========================================================================
     Event handlers, state changes
     ========================================================================== */

  // Update the board size state
  function handle_queens_board_size_select(event) {
    const value = parseInt(event.target.value, 10);
    state.update('board_size', value);
  }

  // Update the timeout duration state
  function handle_step_timeout_duration_select(event) {
    const value = parseInt(event.target.value, 10);
    state.update('step_timeout_duration', value);
  }

  // Rerun the algorithm
  async function handle_submit_button_click(event) {
    await abort_current_algoritm_execution();
    state.update('running_algorithm', start_algorithm_execution());
  }

  // Render an empty board
  async function handle_abort_button_click(event) {
    await abort_current_algoritm_execution();
    render_demo_queens_problem(
      'queens-board-container',
      create_initial_board(state.get('board_size'))
    );
  }

  // Stop the execution if the algorithm is currently running
  async function abort_current_algoritm_execution() {
    if (state.get('running_algorithm')) {
      state.update('aborting', true);
      await state.get('running_algorithm');
      state.update('running_algorithm', null);
      state.update('aborting', false);
    }
  }

  // Enable/disable the abort button when the algorithm starts/stops
  state.on_change('running_algorithm', function handle_algorithm_start() {
    if (state.get('running_algorithm')) {
      enable_abort_button();
    } else {
      disable_abort_button();
    }
  });

  // Render a new empty board with the new size
  state.on_change('board_size', async function hanlde_board_size_change(data) {
    if (state.get('running_algorithm')) {
      return;
    }
    render_demo_queens_problem(
      'queens-board-container',
      create_initial_board(data.new_value)
    );
  });

  function enable_abort_button() {
    document
      .querySelector('.queens-controls .queens-controls__abort-button')
      .disabled = false;
  }

  function disable_abort_button() {
    document
      .querySelector('.queens-controls .queens-controls__abort-button')
      .disabled = true;
  }

  // Add event listeners
  function equip_queens_controls() {
    document
      .querySelector(`
        .queens-controls
        .queens-controls__control-container[data-type="board-size"]
        .queens-controls__input`)
      .addEventListener('change', handle_queens_board_size_select);

    document
      .querySelector(`
        .queens-controls
        .queens-controls__control-container[data-type="step-timeout"]
        .queens-controls__input`)
      .addEventListener('change', handle_step_timeout_duration_select);

    document
      .querySelector('.queens-controls .queens-controls__submit-button')
      .addEventListener('click', handle_submit_button_click);

    document
      .querySelector('.queens-controls .queens-controls__abort-button')
      .addEventListener('click', handle_abort_button_click);
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
    <div
      class="queens-board
      ${empty_board ? 'queens-board--loading' : ''}
      ${meta_info && meta_info.should_animate_queens ? 'queens-board--animate' : ''}
      ${meta_info && meta_info.solved ? 'queens-board--solved' : ''}"
      style="grid-template-columns: repeat(${board.length}, 1fr);">
      ${board.map(function create_row_view(row, row_index, board) {
        return row.map(function create_cell_view(cell, cell_index) {
          return `<div
            data-field_color="${get_cell_color(cell_index, row_index, board)}"
            data-index_x="${cell_index}"
            data-index_y="${row_index}"
            data-index="${`${row_index}${cell_index}`}"
            data-value="${cell.value}"
            data-attackers_count="${
              cell.attackers.reduce(function accumulate_attackers (sum) {
                return sum + 1;
              }, 0)
            }"
            class="queens-board__cell ${
              cell.is_last_added_cell
                ? 'queens-board__cell--is-last-added-cell'
                : ''
            }"></div>`;
        }).join('');
      }).join('')}
    </div>
    ${
      meta_info
        ? `<div class="queens-meta">
            ${ 'step_count' in meta_info
              ? `<p class="queens-meta__step-count">
                  <span class="queens-meta__step-count-label">Steps:</span>
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
  async function render_and_display_metrics(target, board, solver) {
    let step_count = 0;
    let start_time = window.performance.now();
    render_demo_queens_problem(target, board);
    const solved_board = await solver(
      board,
      async function (board, step_info) {
        // Abort execution
        if (state.get('aborting') === true) {
          return false;
        }
        // Avoid blocking the UI
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
  async function render_demo_queens_problem_with_steps(
    target,
    board,
    solver
  ) {
    let step_count = 0;
    render_demo_queens_problem(target, board);
    const solved_board = await solver(
      board,
      async function (board, step_info, cell) {
        // Abort execution
        if (state.get('aborting') === true) {
          return false;
        }
        // Count how many times a queen has been set on the board
        if (step_info && step_info.step_type && step_info.step_type === 'forward') {
          step_count += 1;
          // For displaying an animation for the most
          // recent added cell.
          board.flat().forEach(function (current_cell) {
            delete current_cell.is_last_added_cell;
          });
          cell.is_last_added_cell = true;
        }
        if (step_info && step_info.step_type && step_info.step_type === 'backward') {
          delete cell.is_last_added_cell;
        }
        await wait(state.get('step_timeout_duration'));
        render_demo_queens_problem(target, board, {
          step_count,
          // Animate the queens when the step timeout is set to be at
          // least 500 ms
          should_animate_queens:
            state.get('step_timeout_duration') >= minimum_time_for_showing_queens_animation
              ? true
              : false
        });
        return true;
      }
    );
    render_demo_queens_problem(target, solved_board, { step_count, solved: true });
  }

  function set_default_board_size() {
    const input_element = document
      .querySelector(`
        .queens-controls
        .queens-controls__control-container[data-type="board-size"]
        .queens-controls__input
      `);
    const value = parseInt(input_element.value, 10);
    state.update('board_size', value);
  }

  function set_default_timeout_duration() {
    const input_element = document
      .querySelector(`
        .queens-controls
        .queens-controls__control-container[data-type="step-timeout"]
        .queens-controls__input
      `);
    const value = parseInt(input_element.value, 10);
    state.update('step_timeout_duration', value);
  }

  async function start_algorithm_execution() {
    return render_demo_queens_problem_with_steps(
      'queens-board-container',
      create_initial_board(state.get('board_size')),
      solver_set_queens_random
    );
  }

  function initialize() {
    equip_queens_controls();
    set_default_board_size();
    set_default_timeout_duration();
  }

  initialize();

  /**
   * @param {Queens_board}
   */
  function print_queens_to_console(board) {
    console.table(board.map(row => row.map(cell => cell.value)));
  }

}());
